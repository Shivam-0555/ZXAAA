import Message from '../models/Message.js';

// @desc    Get user conversation threads
// @route   GET /api/messages/conversations
// @access  Private
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email phone trustScore profileImage')
      .populate('receiver', 'name email phone trustScore profileImage')
      .populate('product', 'title price images category');

    // Group by unique counterpart user + product
    const convoMap = new Map();

    for (const msg of messages) {
      if (!msg.sender || !msg.receiver) continue;
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      const prodId = msg.product?._id ? msg.product._id.toString() : 'general';
      const key = `${otherUser._id}_${prodId}`;

      if (!convoMap.has(key)) {
        convoMap.set(key, {
          id: key,
          otherUser,
          product: msg.product || { title: 'Direct Discussion' },
          lastMessage: msg.content,
          createdAt: msg.createdAt,
          read: msg.read,
          unreadCount: (!msg.read && msg.receiver._id.toString() === userId.toString()) ? 1 : 0
        });
      }
    }

    const conversations = Array.from(convoMap.values());
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all messages between two users for a specific product
// @route   GET /api/messages/:receiverId/:productId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { receiverId, productId } = req.params;
    const senderId = req.user._id;

    const query = {
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    };

    if (productId && productId !== 'general' && productId !== 'undefined') {
      query.product = productId;
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate('sender', 'name')
      .populate('receiver', 'name');

    // Mark unread messages as read
    await Message.updateMany(
      { sender: receiverId, receiver: senderId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiver, product, content } = req.body;
    const sender = req.user._id;

    if (!content || !receiver) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }

    const message = new Message({
      sender,
      receiver,
      product: (product && product !== 'general') ? product : undefined,
      content: content.trim(),
    });

    const savedMessage = await message.save();
    await savedMessage.populate('sender', 'name');
    await savedMessage.populate('receiver', 'name');

    res.status(201).json({ success: true, data: savedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
