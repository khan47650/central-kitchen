const moongose=require("mongoose");

const contactSchema=new moongose.Schema({
 name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true }
},{ timestamps: true });

module.exports=moongose.model('Contact',contactSchema);