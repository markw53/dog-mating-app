// controllers/messageController.ts
import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    // Type assertion to ensure it's a string
    const conversationId = req.params.conversationId as string;

    // Validate
    if (!conversationId || Array.isArray(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    console.log('📨 Getting messages for conversation:', conversationId);

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            id: req.user!.id,
          },
        },
      },
    });

    if (!conversation) {
      console.log('❌ Conversation not found or user not authorized');
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId, // Now properly typed
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            city: true,
            county: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            city: true,
            county: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log('✅ Found', messages.length, 'messages');

    res.json({
      success: true,
      messages,
      total: messages.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Get messages error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📋 Getting conversations for user:', req.user?.id);

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
            verified: true,
            city: true,
            county: true,
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
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    console.log('✅ Found', conversations.length, 'conversations');

    res.json({
      success: true,
      conversations,
      total: conversations.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Get conversations error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.params.conversationId as string;
    
    // Validate
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

    console.log('📤 Sending message:', { conversationId, from: req.user?.id, to: receiverId });

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            id: req.user!.id,
          },
        },
      },
    });

    if (!conversation) {
      console.log('❌ Conversation not found or user not authorized');
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId: conversationId,
        senderId: req.user!.id,
        receiverId: receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            city: true,
            county: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            city: true,
            county: true,
          },
        },
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
      },
    });

    console.log('✅ Message sent:', message.id);

    res.json({
      success: true,
      message,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Send message error:', err);
    res.status(500).json({ message: err.message });
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

    console.log('💬 Creating conversation:', { from: req.user?.id, to: participantId, dogId });

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { id: req.user!.id },
            },
          },
          {
            participants: {
              some: { id: participantId },
            },
          },
          ...(dogId ? [{ dogId: dogId }] : []),
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            city: true,
            county: true,
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
    });

    if (existingConversation) {
      console.log('✅ Found existing conversation:', existingConversation.id);
      return res.json({
        success: true,
        conversation: existingConversation,
      });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: req.user!.id }, { id: participantId }],
        },
        ...(dogId && { dog: { connect: { id: dogId } } }),
        ...(initialMessage && {
          lastMessage: initialMessage,
          lastMessageAt: new Date(),
        }),
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            city: true,
            county: true,
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
    });

    console.log('✅ Created new conversation:', conversation.id);

    // Send initial message if provided
    if (initialMessage) {
      await prisma.message.create({
        data: {
          content: initialMessage,
          conversationId: conversation.id,
          senderId: req.user!.id,
          receiverId: participantId,
        },
      });
      console.log('✅ Sent initial message');
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Create conversation error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.params.conversationId as string;

    if (!conversationId || Array.isArray(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    console.log('📖 Marking messages as read:', conversationId);

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            id: req.user!.id,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark all messages as read where user is the receiver
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        receiverId: req.user!.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    console.log('✅ Messages marked as read');

    res.json({
      success: true,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Mark as read error:', err);
    res.status(500).json({ message: err.message });
  }
};