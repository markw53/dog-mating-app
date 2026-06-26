import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.params.conversationId as string;

    if (!conversationId || Array.isArray(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: req.user!.id } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true, firstName: true, lastName: true,
            avatar: true, verified: true, city: true, county: true,
          },
        },
        receiver: {
          select: {
            id: true, firstName: true, lastName: true,
            avatar: true, verified: true, city: true, county: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, messages, total: messages.length });
  } catch (error) {
    logger.error({ err: error }, 'Get messages error');
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { id: req.user!.id } },
      },
      include: {
        participants: {
          select: {
            id: true, firstName: true, lastName: true,
            avatar: true, verified: true, city: true, county: true,
          },
        },
        dog: {
          select: { id: true, name: true, breed: true, mainImage: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    res.json({ success: true, conversations, total: conversations.length });
  } catch (error) {
    logger.error({ err: error }, 'Get conversations error');
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.params.conversationId as string;

    if (!conversationId || Array.isArray(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const { content, receiverId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: req.user!.id } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId,
        senderId: req.user!.id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true, firstName: true, lastName: true,
            avatar: true, verified: true, city: true, county: true,
          },
        },
        receiver: {
          select: {
            id: true, firstName: true, lastName: true,
            avatar: true, verified: true, city: true, county: true,
          },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: content.trim(), lastMessageAt: new Date() },
    });

    res.json({ success: true, message });
  } catch (error) {
    logger.error({ err: error }, 'Send message error');
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId, dogId, initialMessage } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    if (participantId === req.user!.id) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: req.user!.id } } },
          { participants: { some: { id: participantId } } },
          ...(dogId ? [{ dogId }] : []),
        ],
      },
      include: {
        participants: {
          select: {
            id: true, firstName: true, lastName: true,
            avatar: true, verified: true, city: true, county: true,
          },
        },
        dog: {
          select: { id: true, name: true, breed: true, mainImage: true },
        },
      },
    });

    if (existingConversation) {
      return res.json({ success: true, conversation: existingConversation });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: { connect: [{ id: req.user!.id }, { id: participantId }] },
        ...(dogId && { dog: { connect: { id: dogId } } }),
        ...(initialMessage && {
          lastMessage: initialMessage,
          lastMessageAt: new Date(),
        }),
      },
      include: {
        participants: {
          select: {
            id: true, firstName: true, lastName: true,
            avatar: true, verified: true, city: true, county: true,
          },
        },
        dog: {
          select: { id: true, name: true, breed: true, mainImage: true },
        },
      },
    });

    if (initialMessage) {
      await prisma.message.create({
        data: {
          content: initialMessage,
          conversationId: conversation.id,
          senderId: req.user!.id,
          receiverId: participantId,
        },
      });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    logger.error({ err: error }, 'Create conversation error');
    res.status(500).json({ success: false, message: 'Failed to create conversation' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.params.conversationId as string;

    if (!conversationId || Array.isArray(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: req.user!.id } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await prisma.message.updateMany({
      where: { conversationId, receiverId: req.user!.id, read: false },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Mark as read error');
    res.status(500).json({ success: false, message: 'Failed to mark messages as read' });
  }
};
