import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { Gender, Status } from '@prisma/client';
import { geocodeAddress, getFallbackCoordinates } from '../utils/geocoding';
import logger from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';

export const createDog = async (req: AuthRequest, res: Response) => {
  try {
    const genderUpper = (req.body.gender as string).toUpperCase() as Gender;

    let latitude: number | null = null;
    let longitude: number | null = null;

    if (req.body.latitude && req.body.longitude) {
      latitude = parseFloat(req.body.latitude);
      longitude = parseFloat(req.body.longitude);
    } else {
      const coords = await geocodeAddress(
        req.body.address,
        req.body.city,
        req.body.county,
        req.body.postcode,
        req.body.country || 'UK',
      );

      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      } else {
        const fallback = getFallbackCoordinates(req.body.city);
        if (fallback) {
          latitude = fallback.latitude;
          longitude = fallback.longitude;
        }
      }
    }

    const dogData = {
      name: req.body.name,
      breed: req.body.breed,
      gender: genderUpper,
      dateOfBirth: new Date(req.body.dateOfBirth),
      age: parseInt(req.body.age),
      weight: parseFloat(req.body.weight),
      color: req.body.color,
      description: req.body.description,
      images: req.body.images || [],
      mainImage: req.body.mainImage || null,
      vaccinated: Boolean(req.body.vaccinated),
      neutered: Boolean(req.body.neutered),
      vetName: req.body.vetName || null,
      vetContact: req.body.vetContact || null,
      medicalHistory: req.body.medicalHistory || null,
      registered: Boolean(req.body.registered),
      registrationNumber: req.body.registrationNumber || null,
      registry: req.body.registry || null,
      sire: req.body.sire || null,
      dam: req.body.dam || null,
      available: req.body.available !== false,
      studFee: req.body.studFee ? parseFloat(req.body.studFee) : null,
      studFeeNegotiable: Boolean(req.body.studFeeNegotiable),
      previousLitters: parseInt(req.body.previousLitters) || 0,
      temperament: req.body.temperament || [],
      address: req.body.address || null,
      city: req.body.city,
      county: req.body.county,
      postcode: req.body.postcode || null,
      country: req.body.country || 'UK',
      latitude,
      longitude,
      ownerId: req.user!.id,
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

    logger.info({ dogId: dog.id, userId: req.user!.id }, 'Dog created');

    res.status(201).json({ success: true, dog });
  } catch (error) {
    logger.error({ err: error }, 'Create dog error');
    res.status(500).json({ success: false, message: 'Failed to create dog' });
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
      available,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { status: Status.ACTIVE };

    if (breed) where.breed = { contains: breed as string, mode: 'insensitive' };

    if (gender) {
      const genderUpper = (gender as string).toUpperCase();
      if (genderUpper === 'MALE' || genderUpper === 'FEMALE') {
        where.gender = genderUpper as Gender;
      }
    }

    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (county) where.county = { contains: county as string, mode: 'insensitive' };

    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = parseInt(minAge as string);
      if (maxAge) where.age.lte = parseInt(maxAge as string);
    }

    if (available === 'true') where.available = true;

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
  } catch (error) {
    logger.error({ err: error }, 'Get all dogs error');
    res.status(500).json({ success: false, message: 'Failed to fetch dogs' });
  }
};

export const getMyDogs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const dogs = await prisma.dog.findMany({
      where: { ownerId: req.user.id },
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
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, dogs, total: dogs.length });
  } catch (error) {
    logger.error({ err: error }, 'Get my dogs error');
    res.status(500).json({ success: false, message: 'Failed to fetch your dogs' });
  }
};

export const getDogById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

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

    await prisma.dog.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({ success: true, dog });
  } catch (error) {
    logger.error({ err: error }, 'Get dog by ID error');
    res.status(500).json({ success: false, message: 'Failed to fetch dog' });
  }
};

export const updateDog = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

    const dog = await prisma.dog.findUnique({ where: { id } });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (dog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      name, breed, gender, dateOfBirth, age, weight, color, description, images, mainImage,
      vaccinated, neutered, vetName, vetContact, medicalHistory,
      registered, registrationNumber, registry, sire, dam,
      available, studFee, studFeeNegotiable, previousLitters, temperament,
      address, city, county, postcode, country, latitude, longitude, status,
    } = req.body;

    let newLatitude: number | null | undefined = undefined;
    let newLongitude: number | null | undefined = undefined;

    if (latitude !== undefined) newLatitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) newLongitude = longitude ? parseFloat(longitude) : null;

    const locationChanged =
      (city && city !== dog.city) ||
      (county && county !== dog.county) ||
      (address !== undefined && address !== dog.address) ||
      (postcode !== undefined && postcode !== dog.postcode);

    if (locationChanged && latitude === undefined && longitude === undefined) {
      const coords = await geocodeAddress(
        address !== undefined ? address : dog.address,
        city || dog.city,
        county || dog.county,
        postcode !== undefined ? postcode : dog.postcode,
        country || dog.country,
      );

      if (coords) {
        newLatitude = coords.latitude;
        newLongitude = coords.longitude;
      } else {
        const fallback = getFallbackCoordinates(city || dog.city);
        if (fallback) {
          newLatitude = fallback.latitude;
          newLongitude = fallback.longitude;
        }
      }
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (breed) updateData.breed = breed;
    if (gender) updateData.gender = (gender as string).toUpperCase() as Gender;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (age !== undefined) updateData.age = parseInt(age);
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (color) updateData.color = color;
    if (description) updateData.description = description;
    if (images) updateData.images = images;
    if (mainImage !== undefined) updateData.mainImage = mainImage;
    if (vaccinated !== undefined) updateData.vaccinated = Boolean(vaccinated);
    if (neutered !== undefined) updateData.neutered = Boolean(neutered);
    if (vetName !== undefined) updateData.vetName = vetName || null;
    if (vetContact !== undefined) updateData.vetContact = vetContact || null;
    if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory || null;
    if (registered !== undefined) updateData.registered = Boolean(registered);
    if (registrationNumber !== undefined) updateData.registrationNumber = registrationNumber || null;
    if (registry !== undefined) updateData.registry = registry || null;
    if (sire !== undefined) updateData.sire = sire || null;
    if (dam !== undefined) updateData.dam = dam || null;
    if (available !== undefined) updateData.available = Boolean(available);
    if (studFee !== undefined) updateData.studFee = studFee ? parseFloat(studFee) : null;
    if (studFeeNegotiable !== undefined) updateData.studFeeNegotiable = Boolean(studFeeNegotiable);
    if (previousLitters !== undefined) updateData.previousLitters = parseInt(previousLitters) || 0;
    if (temperament) updateData.temperament = temperament;
    if (address !== undefined) updateData.address = address || null;
    if (city) updateData.city = city;
    if (county) updateData.county = county;
    if (postcode !== undefined) updateData.postcode = postcode || null;
    if (country) updateData.country = country;
    if (newLatitude !== undefined) updateData.latitude = newLatitude;
    if (newLongitude !== undefined) updateData.longitude = newLongitude;
    if (status) updateData.status = status as Status;

    const updatedDog = await prisma.dog.update({
      where: { id },
      data: updateData,
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

    res.json({ success: true, dog: updatedDog });
  } catch (error) {
    logger.error({ err: error }, 'Update dog error');
    res.status(500).json({ success: false, message: 'Failed to update dog' });
  }
};

export const deleteDog = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

    const dog = await prisma.dog.findUnique({ where: { id } });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (dog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.dog.delete({ where: { id } });

    res.json({ success: true, message: 'Dog deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Delete dog error');
    res.status(500).json({ success: false, message: 'Failed to delete dog' });
  }
};

export const uploadDogImages = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const dog = await prisma.dog.findUnique({ where: { id } });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (dog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const files = req.files as Express.Multer.File[];
    const imagePaths = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer, 'dogmate/dogs')),
    );

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

    res.json({ success: true, images: imagePaths, dog: updatedDog });
  } catch (error) {
    logger.error({ err: error }, 'Upload dog images error');
    res.status(500).json({ success: false, message: 'Failed to upload images' });
  }
};
