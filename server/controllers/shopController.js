const Shop = require("../models/Shop");
const cloudinary = require("../utils/cloudinary");
const { calculateShopStatus } = require("../utils/shopStatus");
const { applyEditLock } = require("../utils/lockRule");
const Category = require("../models/Category");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");


const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

//add shop
exports.addShop = async (req, res) => {
  try {
    const { shopName, description, address } = req.body;
    const { userId } = req.params;

    if (!shopName || !address || !description) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Shop image is required" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "shops",
      public_id: `shop_${Date.now()}`,
    });

    const shopImageUrl = result.secure_url;

    const timings = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
      day,
      open: false,
      openTime: "",
      closeTime: "",
      break: false,
      breakStart: "",
      breakEnd: "",
      isLockedForEdit: false
    }));

    const shop = await Shop.create({
      userId,
      shopName,
      description,
      address,
      shopImage: shopImageUrl,
      status: "close",
      timings
    });

    res.status(201).json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get client shops
exports.getUserShops = async (req, res) => {
  try {
    const { userId } = req.params;

    const shops = await Shop.find({ userId }).lean();

    const updated = shops.map(shop => {
      const timingsWithLock = applyEditLock(shop.timings);
      const status = calculateShopStatus(timingsWithLock);

      return {
        ...shop,
        timings: timingsWithLock,
        status
      };
    });

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    let { timings, shopName, address, description } = req.body;

    if (typeof timings === 'string') timings = JSON.parse(timings);

    // Populate subscribers for email
    const shop = await Shop.findById(shopId).populate("subscribers");
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const oldTimings = JSON.parse(JSON.stringify(shop.timings)); // deep copy

    // Image upload if new file
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "shops",
        public_id: `shop_${Date.now()}`,
      });
      shop.shopImage = result.secure_url;
    }

    // Locked timings protection
    shop.timings.forEach((oldRow, index) => {
      if (oldRow.isLockedForEdit && timings[index]) {
        timings[index] = oldRow;
      }
    });

    // Sanitize timings
    const sanitizedTimings = timings.map(t => ({
      day: t.day || "Mon",
      open: typeof t.open === "boolean" ? t.open : false,
      openTime: t.openTime || "",
      closeTime: t.closeTime || "",
      break: typeof t.break === "boolean" ? t.break : false,
      breakStart: t.breakStart || "",
      breakEnd: t.breakEnd || "",
      isLockedForEdit: typeof t.isLockedForEdit === "boolean" ? t.isLockedForEdit : false
    }));

    shop.timings = sanitizedTimings;
    shop.shopName = shopName || shop.shopName;
    shop.address = address || shop.address;
    shop.description = description || shop.description;

    shop.status = calculateShopStatus(shop.timings);

    await shop.save();

    // ---------------- SEND EMAIL IF TIMINGS CHANGED ----------------
    let hasChange = false;
    for (let i = 0; i < shop.timings.length; i++) {
      const oldRow = oldTimings[i];
      const newRow = shop.timings[i];
      if (
        oldRow.open !== newRow.open ||
        oldRow.openTime !== newRow.openTime ||
        oldRow.closeTime !== newRow.closeTime ||
        oldRow.break !== newRow.break ||
        oldRow.breakStart !== newRow.breakStart ||
        oldRow.breakEnd !== newRow.breakEnd
      ) {
        hasChange = true;
        break;
      }
    }

    if (hasChange && shop.subscribers.length > 0) {
      const emails = shop.subscribers.map(s => s.email).filter(Boolean);

      const timingRows = shop.timings.map(t => {
        // Convert 24h to 12h format
        const openTime = t.open ? moment(t.openTime, "HH:mm").format("hh:mm A") : "-";
        const closeTime = t.open ? moment(t.closeTime, "HH:mm").format("hh:mm A") : "-";
        const breakTime = t.break ? `${moment(t.breakStart, "HH:mm").format("hh:mm A")} - ${moment(t.breakEnd, "HH:mm").format("hh:mm A")}` : "-";

        return `
    <tr>
      <td>${t.day}</td>
      <td>${openTime}</td>
      <td>${closeTime}</td>
      <td>${breakTime}</td>
    </tr>
  `;
      }).join("");

      const html = `
        <h3>Hello!</h3>
        <p>The timings for <strong>${shop.shopName}</strong> have been updated. Here is the latest schedule:</p>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;">
          <thead>
            <tr>
              <th>Day</th>
              <th>Open Time</th>
              <th>Close Time</th>
              <th>Break</th>
            </tr>
          </thead>
          <tbody>
            ${timingRows}
          </tbody>
        </table>
      `;

      // Send emails
      for (const email of emails) {
        await sendEmail(email, `Update in ${shop.shopName} Timings`, html);
      }
    }

    res.json(shop);
  } catch (err) {
    console.error("UpdateShop error:", err);
    res.status(500).json({ message: err.message });
  }
};



//Delete shop
exports.deleteShop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Shop ID is required" });
    }
    const shop = await Shop.findByIdAndDelete(id);

    await Category.deleteMany({ shopId: id });

    res.status(201).json({ message: "Shop deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get all shops
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().lean();
    res.status(200).json(shops);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


