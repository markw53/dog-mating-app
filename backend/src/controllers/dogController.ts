// controllers/dogController.ts
import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { Gender, Status } from '@prisma/client';

export const createDog = async (req: AuthRequest, res: Response) => {
  try {
    const dogData = {
      ...req.body,
      ownerId: req.user!.id,
      age: parseInt(req.body.age),
      weight: parseFloat(req.body.weight),
      dateOfBirth: new Date(req.body.dateOfBirth),
      gender: req.body.gender as Gender,
      status: Status.PENDING,
    };

    const dog = await prisma.dog.create({
      data: dogData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      dog,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Create dog error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllDogs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '12',
      breed,
      gender,
      minAge,
      maxAge,
      city,
      county,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      status: Status.ACTIVE,
    };

    if (breed) where.breed = { contains: breed as string, mode: 'insensitive' };
    if (gender) where.gender = gender as Gender;
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (county) where.county = { contains: county as string, mode: 'insensitive' };
    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = parseInt(minAge as string);
      if (maxAge) where.age.lte = parseInt(maxAge as string);
    }

    const [dogs, total] = await Promise.all([
      prisma.dog.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              city: true,
              county: true,
            },
          },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.dog.count({ where }),
    ]);

    res.json({
      success: true,
      dogs,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Get all dogs error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getMyDogs = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📋 Getting dogs for user:', req.user?.id);

    const dogs = await prisma.dog.findMany({
      where: {
        ownerId: req.user!.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            city: true,
            county: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('✅ Found', dogs.length, 'dogs for user');

    res.json({
      success: true,
      dogs,
      total: dogs.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Get my dogs error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getDogById = async (req: AuthRequest, res: Response) => {
  try {
    // Type assertion to fix TypeScript error
    const id = req.params.id as string;

    // Validate
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

    const dog = await prisma.dog.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            city: true,
            county: true,
            verified: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    // Increment views
    await prisma.dog.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({
      success: true,
      dog,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Get dog by ID error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateDog = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

    console.log('🔧 Updating dog:', id);
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

    const dog = await prisma.dog.findUnique({
      where: { id },
    });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    // Check ownership
    if (dog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      name,
      breed,
      gender,
      dateOfBirth,
      age,
      weight,
      color,
      description,
      images,
      mainImage,
      // Health Info
      vaccinated,
      neutered,
      vetName,
      vetContact,
      medicalHistory,
      // Pedigree
      registered,
      registrationNumber,
      registry,
      sire,
      dam,
      // Breeding
      available,
      studFee,
      studFeeNegotiable,
      previousLitters,
      temperament,
      // Location
      address,
      city,
      county,
      postcode,
      country,
      latitude,
      longitude,
      status,
    } = req.body;

    console.log('🔍 Extracted fields:', {
      address,
      city,
      county,
      postcode,
      vaccinated,
      neutered,
      available,
      registered,
    });

    const updatedDog = await prisma.dog.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(breed && { breed }),
        ...(gender && { gender }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(age !== undefined && { age: parseInt(age) }),
        ...(weight !== undefined && { weight: parseFloat(weight) }),
        ...(color && { color }),
        ...(description && { description }),
        ...(images && { images }),
        ...(mainImage !== undefined && { mainImage }),
        
        // Health Info
        ...(vaccinated !== undefined && { vaccinated: Boolean(vaccinated) }),
        ...(neutered !== undefined && { neutered: Boolean(neutered) }),
        ...(vetName !== undefined && { vetName: vetName || null }),
        ...(vetContact !== undefined && { vetContact: vetContact || null }),
        ...(medicalHistory !== undefined && { medicalHistory: medicalHistory || null }),
        
        // Pedigree
        ...(registered !== undefined && { registered: Boolean(registered) }),
        ...(registrationNumber !== undefined && { registrationNumber: registrationNumber || null }),
        ...(registry !== undefined && { registry: registry || null }),
        ...(sire !== undefined && { sire: sire || null }),
        ...(dam !== undefined && { dam: dam || null }),
        
        // Breeding
        ...(available !== undefined && { available: Boolean(available) }),
        ...(studFee !== undefined && { studFee: studFee ? parseFloat(studFee) : null }),
        ...(studFeeNegotiable !== undefined && { studFeeNegotiable: Boolean(studFeeNegotiable) }),
        ...(previousLitters !== undefined && { previousLitters: parseInt(previousLitters) || 0 }),
        ...(temperament && { temperament }),
        
        // Location
        ...(address !== undefined && { address: address || null }),
        ...(city && { city }),
        ...(county && { county }),
        ...(postcode !== undefined && { postcode: postcode || null }),
        ...(country && { country }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        
        ...(status && { status: status as Status }),
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            city: true,
            county: true,
          },
        },
      },
    });

    console.log('✅ Dog updated successfully:', {
      id: updatedDog.id,
      name: updatedDog.name,
      address: updatedDog.address,
      vaccinated: updatedDog.vaccinated,
      available: updatedDog.available,
    });

    res.json({
      success: true,
      dog: updatedDog,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Update dog error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteDog = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

    const dog = await prisma.dog.findUnique({
      where: { id },
    });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    // Check ownership
    if (dog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.dog.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Dog deleted successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Delete dog error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const uploadDogImages = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: 'Invalid dog ID' });
    }
    
    console.log('📸 Uploading images for dog:', id);
    console.log('📁 Files:', req.files);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const dog = await prisma.dog.findUnique({
      where: { id },
    });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (dog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get image paths
    const imagePaths = (req.files as Express.Multer.File[]).map(
      (file) => `/uploads/${file.filename}`
    );

    console.log('✅ Image paths:', imagePaths);

    // Update dog with new images
    const updatedDog = await prisma.dog.update({
      where: { id },
      data: {
        images: [...dog.images, ...imagePaths],
        ...(dog.images.length === 0 && { mainImage: imagePaths[0] }),
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            city: true,
            county: true,
          },
        },
      },
    });

    res.json({
      success: true,
      images: imagePaths,
      dog: updatedDog,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Upload images error:', err);
    res.status(500).json({ message: err.message });
  }
};