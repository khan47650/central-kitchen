const mongoose = require("mongoose");

const PublicUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  email: { type: String, required: true, unique: true },
  contact: { type: String },
  address: { type: String },

  subscribedShops: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shops",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("PublicUser", PublicUserSchema);