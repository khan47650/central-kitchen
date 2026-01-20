const express =require("express");
const router=express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {addCategory,deleteCategory,addItem,editItem,deleteItem,
    getCategories,updateItemStatus,getAllCategories,getShopCategories}=require("../controllers/CategoryController");

router.post("/add/:userId",addCategory);
router.get("/all",getAllCategories);
router.get("/user/:userId", getCategories);
router.delete("/delete/:categoryId", deleteCategory);
router.post("/item/:categoryId",upload.single("image"), addItem);
router.put( "/editItem/:categoryId/:itemId",upload.single("image"),editItem);
router.delete( "/deleteItem/:categoryId/:itemId",deleteItem);
router.put("/updateItemStatus/:categoryId/:itemId", updateItemStatus);
router.get("/all/:shopId",getShopCategories);







module.exports=router;

