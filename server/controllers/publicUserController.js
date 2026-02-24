const PublicUser = require("../models/PublicUser");
const Shop = require("../models/Shop");

// REGISTER PUBLIC USER
exports.registerPublicUser= async (req, res) => {
  try {
    const user = await PublicUser.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL SHOPS
exports.getAllShops=async (req, res) => {
  const shops = await Shop.find().select("shopName");
  res.json(shops);
};

// UPDATE SUBSCRIPTIONS
exports.updateSubscription= async (req, res) => {
  const { userId, shopIds } = req.body;

  const user = await PublicUser.findById(userId);
  if (!user) return res.status(404).json({ msg: "User not found" });

  // Remove user from old shops
  await Shop.updateMany(
    { subscribers: userId },
    { $pull: { subscribers: userId } }
  );

  // Add user to selected shops
  await Shop.updateMany(
    { _id: { $in: shopIds } },
    { $addToSet: { subscribers: userId } }
  );

  user.subscribedShops = shopIds;
  await user.save();

  res.json({ success: true });
};

// DELETE USER (UNREGISTER)
exports.deleteUser=async (req, res) => {
  const id = req.params.id;

  await Shop.updateMany(
    { subscribers: id },
    { $pull: { subscribers: id } }
  );

  await PublicUser.findByIdAndDelete(id);

  res.json({ success: true });
};