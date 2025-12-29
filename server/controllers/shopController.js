const Shop =require("../models/Shop");
const cloudinary=require("../utils/cloudinary");
const { calculateShopStatus } = require("../utils/shopStatus");
const { applyEditLock } = require("../utils/lockRule");


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

    const timings = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => ({
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

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

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

    res.json(shop);
  } catch (err) {
    console.error("UpdateShop error:", err);
    res.status(500).json({ message: err.message });
  }
};



//Delete shop
exports.deleteShop=async(req,res)=>{
try{
  const {id}=req.params;

  if(!id){
    return res.status(400).json({ message: "Shop ID is required" });
  }
  const shop=await Shop.findByIdAndDelete(id);
  res.status(201).json({message:"Shop deleted successfully"});

}catch(err){
  res.status(500).json({message:err.message});
}
};

//get all shops
exports.getAllShops=async(req,res)=>{
  try{
    const shops=await Shop.find().lean();
    res.status(200).json(shops);

  }catch(err){
    res.status(500).json({message:err.message});
  }
};


