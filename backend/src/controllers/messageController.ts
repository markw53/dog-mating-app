import { Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { AuthRequest } from '../middleware/auth';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user!._id
    })
      .populate('participants', 'firstName lastName avatar')
      .populate('dogReference', 'name breed mainImage')
      .sort('-lastMessageAt');

    res.json({ success: true, conversations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrCreateConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId, dogId } = req.body;

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user!._id, recipientId] }
    }).populate('participants', 'firstName lastName avatar');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user!._id, recipientId],
        dogReference: dogId || undefined
      });
      
      await conversation.populate('participants', 'firstName lastName avatar');
    }

    res.json({ success: true, conversation });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'firstName lastName avatar')
      .sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: req.user!._id,
        read: false
      },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content, receiverId } = req.body;

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user!._id,
      receiver: receiverId,
      content
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastMessageAt: new Date()
    });

    await message.populate('sender', 'firstName lastName avatar');

    res.status(201).json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user!._id,
      read: false
    });

    res.json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};