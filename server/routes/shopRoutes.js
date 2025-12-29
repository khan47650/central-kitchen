const express =require("express");
const router=express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {getUserShops,updateShop,addShop,deleteShop,getAllShops}=require("../controllers/shopController");



router.post("/add/:userId", upload.single("shopImage"), addShop);
router.get("/my/:userId",getUserShops);
router.put("/update/:shopId", upload.single("shopImage"), updateShop);
router.delete("/delete/:id",deleteShop);
router.get("/all",getAllShops);


module.exports=router;