const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },         
  email: { type: String, unique: true, required: true },
  password: { type: String, required:true},
  role: { type: String, enum: ['admin', 'client'], default: 'client' },

  status:{type:String,enum:['pending','approved'],default:'pending'},

  // Business info
  businessName: String,
  typeOfBusiness: String,
  preferredLocation: String,
  contactTitle: String,
  contactName: String,
  address: {
    typeOfProperty: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  phone: {
    mobile: String,
    business: String,
    fax: String,
  },
  website: String,
  comments: String,
}, { timestamps: true });

// Compare password method
userSchema.methods.matchPassword = function(password) {
  return this.password === password;
}

// // Hash password 
// userSchema.pre('save', async function(next) {
//   if (this.password && this.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });


// // Compare password method
// userSchema.methods.matchPassword = async function(password) {
//   return await bcrypt.compare(password, this.password);
// }

module.exports = mongoose.model('User', userSchema);
