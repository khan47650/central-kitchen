const Contact=require('../models/Contact');
const sendEmail = require('../utils/sendEmail');

exports.createContact = async (req, res) => {
  try {
    console.log('Contact request body:', req.body);

    const { name, email,subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: 'Name, email and message are required',
      });
    }

    const html = `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    const emailSent = await sendEmail(
      "commissary@centralaz.edu",
      subject || "New Contact Message",
      html
    );

    if (!emailSent) {
      return res.status(500).json({
        message: 'Failed to send message via email',
      });
    }

    return res.status(200).json({
      message: 'Message sent successfully',
    });

  } catch (err) {
    console.error('Contact email error:', err);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};
// exports.getContacts = async (req, res) => {
//   try {
//     const contacts = await Contact.find().sort({ createdAt: -1 });
//     res.json(contacts);
//   } catch (err) {
//     console.error('Error fetching contacts:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };