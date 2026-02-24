const express =require("express");
const router=express.Router();

const {registerPublicUser,getAllShops,updateSubscription,deleteUser}=require("../controllers/publicUserController");

router.post("/register",registerPublicUser);
router.get("/shops",getAllShops);
router.post("/subscribe",updateSubscription);
router.delete("/delete/:id",deleteUser);


module.exports=router;


