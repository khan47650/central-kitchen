const mongoose = require('mongoose');

const TimingSchema=new mongoose.Schema({
    day:{type:String,required:true},
    open:{type:Boolean,default:false},
    openTime:{type:String},
    closeTime:{type:String},
    break:{type:Boolean,default:false},
    breakStart:{type:String},
    breakEnd:{type:String},
    isLockedForEdit:{type:Boolean,default:false}
});
const ShopSchema=new mongoose.Schema({
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User"
        },

        shopName:{type:String,required:true},
        description:{type:String},
        address:{type:String,required:true},
        shopImage:{type:String,required:true},

        status:{
            type:String,
            enum:["open","close","break"],
            default:"close"
        },

        timings:{
            type:[TimingSchema],
            default:[]
        }
},{timestamps:true}
);

module.exports= mongoose.model("Shops",ShopSchema);

