import Contact from '../models/contactModel.js';

export const contactController = {
  getAllMessages: async (req, res, next) => {
    try {
      let contacts = await Contact.find().sort({ createdAt: -1 });

      if (contacts.length === 0) {
        const defaultMessages = [
          {
            name: 'Sarah Connor',
            email: 'sarah.c@cyberdyne.io',
            subject: 'Performance Analysis Query',
            category: 'Performance Issue',
            message: 'Testing our SPA on 3G network shows massive bundle delay before lazy chunking.',
            status: 'Resolved'
          },
          {
            name: 'David Chen',
            email: 'david@devtools.dev',
            subject: 'Inquiry regarding dynamic import() with Vite',
            category: 'Consultation',
            message: 'Could you clarify the best manualChunks configuration for separating third-party vendors?',
            status: 'In Review'
          }
        ];
        contacts = await Contact.insertMany(defaultMessages);
      }

      res.status(200).json({
        success: true,
        count: contacts.length,
        data: contacts
      });
    } catch (error) {
      next(error);
    }
  },

  submitMessage: async (req, res, next) => {
    try {
      const { name, email, subject, category, message } = req.body;

      const newContact = await Contact.create({
        name,
        email,
        subject,
        category: category || 'General Support',
        message
      });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been received.',
        data: newContact
      });
    } catch (error) {
      next(error);
    }
  }
};
