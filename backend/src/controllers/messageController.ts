import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: req.user!.id,
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        dog: {
          select: {
            id: true,
            name: true,
            breed: true,
            mainImage: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    res.json({ success: true, conversations });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrCreateConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId, dogId } = req.body;

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: req.user!.id } } },
          { participants: { some: { id: recipientId } } },
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: req.user!.id }, { id: recipientId }],
          },
          dogId: dogId || null,
        },
        include: {
          participants: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });
    }

    res.json({ success: true, conversation });
  } catch (error: any) {
    console.error('Get or create conversation error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = Array.isArray(req.params.conversationId) 
      ? req.params.conversationId[0] 
      : req.params.conversationId;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: req.user!.id,
        read: false,
      },
      data: { read: true },
    });

    res.json({ success: true, messages });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content, receiverId } = req.body;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: req.user!.id,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    });

    res.status(201).json({ success: true, message });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user!.id,
        read: false,
      },
    });

    res.json({ success: true, count });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: error.message });
  }
};