const Contact=require('../models/Contact');

exports.createContact=async(req,res)=>{
    try{
        console.log('Contact create request body:', req.body);
        const { name, email, subject, message } = req.body;

        if(!name || !email|| !message){
         console.log('Validation failed - missing fields');
         return res.status(400).json({ message: 'Name, email and message are required' });
        }

        const contact=new Contact({name,email,subject,message});
        await contact.save();

        console.log('Contact saved with id:', contact._id);
        return res.status(201).json({message:'Contact saved',contact});

    }catch(err){
         console.error('Error saving contact:', err);
         return res.status(500).json({message:'Server error'});

    }


};
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};