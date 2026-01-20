const mongoose = require('mongoose');


const ItemSchema = new mongoose.Schema({
    image: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    itemStatus: {
        type: String,
        enum: ["IN_STOCK", "OUT_OF_STOCK"],
        default: "IN_STOCK"
    }
});


const CategorySchema = new mongoose.Schema({
     userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shops",
      required: true,
    },
    categoryName: { type: String, required: true },
    categoryDescription: { type: String, default: "" },
    items: {
        type: [ItemSchema],
        default: []
    }
});

module.exports = mongoose.model("Categories", CategorySchema);