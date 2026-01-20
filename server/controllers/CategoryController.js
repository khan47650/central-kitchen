const Category = require("../models/Category");
const cloudinary = require("../utils/cloudinary");
const Shop = require("../models/Shop");

///add category
exports.addCategory = async (req, res) => {
  try {

    const { userId } = req.params;
    const { categoryName, categoryDescription } = req.body;

    if (!userId) return res.status(400).json({ message: "UserId is required" });
    if (!categoryName || categoryName.trim() == "") {
      return res.status(400).json({
        message: "Category Name is required"
      });
    }

    const shop = await Shop.findOne({ userId });
    if (!shop) {
      return res.status(403).json({
        message: "Please create a shop before adding categories",
      });
    }

    const existingCategory = await Category.findOne({
      userId,
      categoryName: categoryName.trim()
    });

    if (existingCategory) {
      return res.status(409).json({ message: "Category Already Exists" });
    }

    const category = await Category.create({
      userId,
      shopId: shop._id,
      categoryName: categoryName.trim(),
      categoryDescription: categoryDescription || "",
      items: [],
    });

    res.status(201).json({ message: "Category added successfully", category });

  } catch (error) {
    console.error("Add Category Error:", error);
    res.status(500).json({ message: "Server Error" });
  }

};


///get All Categories
exports.getAllCategories = async (req, res) => {
  try {

    const categories = await Category.find()
      .populate("shopId", "shopName")
      .lean();

    const formattedCategories = categories.map(cat => ({
      ...cat,
      shopName: cat.shopId?.shopName || "Unknown Shop",
    }));

    res.status(200).json(formattedCategories);

  } catch (error) {
    console.error("Server erroor", error);
    res.status(500).json({ message: error.message })
  }
};

//get categories for user
exports.getCategories = async (req, res) => {
  try {
    const { userId } = req.params;
    const shop = await Shop.findOne({ userId });
    if (!shop) {
      return res.json({ categories: [] });
    }
    const categories = await Category.find({
      userId,
      shopId: shop._id,
    }).lean();

    res.status(201).json({ categories });

  } catch (error) {
    console.error("Fetch categories error", error);
    res.status(500).json({ message: "Server Error" });
  }
};


//get categories for shop
exports.getShopCategories = async (req, res) => {
  try {
    const { shopId } = req.params;

    const categories = await Category.find({ shopId: shopId }).lean();
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Server error", error);
    res.status(500).json({ message: "Server Error" });
  }
};



//Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findOneAndDelete({
      _id: categoryId
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


///add Items
exports.addItem = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, price, description, itemStatus } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Item name and price are required",
      });
    }

    let imageUrl = "";

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "items",
        public_id: `item_${Date.now()}`,
      });
      imageUrl = uploadRes.secure_url;
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const newItem = {
      name: name.trim(),
      price,
      description: description || "",
      image: imageUrl,
      itemStatus: itemStatus || "IN_STOCK",
    };

    category.items.push(newItem);
    await category.save();

    res.status(201).json({
      message: "Item added successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Add Item Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


///Edit Item
exports.editItem = async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    const { name, price, description, itemStatus } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const item = category.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "items",
        public_id: `item_${Date.now()}`,
      });
      item.image = uploadRes.secure_url;
    }

    if (name) item.name = name.trim();
    if (price) item.price = price;
    if (description !== undefined) item.description = description;
    if (itemStatus) item.itemStatus = itemStatus;

    await category.save();

    res.json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Edit Item Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


///Delete Item
exports.deleteItem = async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Remove item by filtering the array
    const originalLength = category.items.length;
    category.items = category.items.filter((it) => it._id.toString() !== itemId);

    if (category.items.length === originalLength) {
      return res.status(404).json({ message: "Item not found" });
    }

    await category.save();
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.updateItemStatus = async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    const { itemStatus } = req.body;

    if (!["IN_STOCK", "OUT_OF_STOCK"].includes(itemStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const item = category.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.itemStatus = itemStatus;
    await category.save();

    res.json({ message: "Item status updated", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
