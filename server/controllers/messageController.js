import Message from '../models/Message.js';

// @desc    Get all messages between two users for a specific product
// @route   GET /api/messages/:receiverId/:productId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { receiverId, productId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      product: productId,
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a new message via API (fallback if socket is not used)
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiver, product, content } = req.body;
    const sender = req.user._id;

    const message = new Message({
      sender,
      receiver,
      product,
      content,
    });

    const savedMessage = await message.save();
    res.status(201).json({ success: true, data: savedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
