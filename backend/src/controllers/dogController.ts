import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Helper function to transform dog data for frontend
const transformDogForFrontend = (dog: any) => {
  return {
    ...dog,
    _id: dog.id, // For backwards compatibility
    healthInfo: {
      vaccinated: dog.vaccinated,
      neutered: dog.neutered,
      veterinarian: dog.vetName ? {
        name: dog.vetName,
        contact: dog.vetContact,
      } : undefined,
      medicalHistory: dog.medicalHistory,
    },
    pedigree: {
      registered: dog.registered,
      registrationNumber: dog.registrationNumber,
      registry: dog.registry,
      sire: dog.sire,
      dam: dog.dam,
    },
    breeding: {
      available: dog.available,
      studFee: dog.studFee,
      studFeeNegotiable: dog.studFeeNegotiable,
      previousLitters: dog.previousLitters,
      temperament: dog.temperament,
    },
    location: {
      address: dog.address,
      city: dog.city,
      state: dog.county,
      zipCode: dog.postcode,
      country: dog.country,
    },
    gender: dog.gender.toLowerCase(),
    status: dog.status.toLowerCase(),
    owner: dog.owner ? {
      ...dog.owner,
      _id: dog.owner.id,
      role: dog.owner.role?.toLowerCase(),
      location: {
        city: dog.owner.city,
        state: dog.owner.county,
        zipCode: dog.owner.postcode,
        address: dog.owner.address,
        country: dog.owner.country,
      }
    } : undefined,
  };
};

export const createDog = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, breed, gender, dateOfBirth, weight, color, description,
      vaccinated, neutered, vetName, vetContact, medicalHistory,
      registered, registrationNumber, registry, sire, dam,
      available, studFee, studFeeNegotiable, previousLitters, temperament,
      address, city, county, postcode, country
    } = req.body;

    console.log('Creating dog with data:', req.body);

    // Calculate age
    const birthDate = new Date(dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    // Handle image uploads
    const images = req.files as Express.Multer.File[];
    const imageUrls = images?.map(file => `/uploads/${file.filename}`) || [];

    // Parse temperament if it's a string
    let temperamentArray: string[] = [];
    if (Array.isArray(temperament)) {
      temperamentArray = temperament;
    } else if (typeof temperament === 'string') {
      try {
        temperamentArray = JSON.parse(temperament);
      } catch {
        temperamentArray = temperament.split(',').map(t => t.trim());
      }
    }

    const dog = await prisma.dog.create({
      data: {
        name,
        breed,
        gender: gender.toUpperCase() as 'MALE' | 'FEMALE',
        dateOfBirth: new Date(dateOfBirth),
        age,
        weight: parseFloat(weight),
        color,
        description,
        images: imageUrls,
        mainImage: imageUrls[0] || null,

        // Health info
        vaccinated: vaccinated === 'true' || vaccinated === true,
        neutered: neutered === 'true' || neutered === true,
        vetName: vetName || null,
        vetContact: vetContact || null,
        medicalHistory: medicalHistory || null,

        // Pedigree
        registered: registered === 'true' || registered === true,
        registrationNumber: registrationNumber || null,
        registry: registry || null,
        sire: sire || null,
        dam: dam || null,

        // Breeding
        available: available === 'true' || available === true,
        studFee: studFee ? parseFloat(studFee) : null,
        studFeeNegotiable: studFeeNegotiable === 'true' || studFeeNegotiable === true,
        previousLitters: previousLitters ? parseInt(previousLitters) : 0,
        temperament: temperamentArray,

        // Location
        address: address || null,
        city: city || '',
        county: county || '',
        postcode: postcode || null,
        country: country || 'UK',

        // Owner
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
            postcode: true,
            address: true,
            country: true,
          },
        },
      },
    });

    console.log('Dog created successfully:', dog.id);

    res.status(201).json({ success: true, dog: transformDogForFrontend(dog) });
  } catch (error: any) {
    console.error('Create dog error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllDogs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      breed,
      gender,
      minAge,
      maxAge,
      city,
      county,
      available,
      page = '1',
      limit = '12',
      sort = 'createdAt',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = { status: 'ACTIVE' };

    if (breed) where.breed = { contains: breed as string, mode: 'insensitive' };
    if (gender) where.gender = (gender as string).toUpperCase();
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (county) where.county = { contains: county as string, mode: 'insensitive' };
    if (available === 'true') where.available = true;

    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = parseInt(minAge as string);
      if (maxAge) where.age.lte = parseInt(maxAge as string);
    }

    // Get total count
    const total = await prisma.dog.count({ where });

    // Get dogs
    const dogs = await prisma.dog.findMany({
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
            postcode: true,
            address: true,
            country: true,
          },
        },
      },
      orderBy: { [sort as string]: 'desc' },
      skip,
      take: limitNum,
    });

    const transformedDogs = dogs.map(transformDogForFrontend);

    res.json({
      success: true,
      dogs: transformedDogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get all dogs error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getDogById = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await prisma.dog.findUnique({
      where: { id: req.params.id as string },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            verified: true,
            city: true,
            county: true,
            postcode: true,
            address: true,
            country: true,
            createdAt: true,
          },
        },
      },
    });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    // Increment views
    await prisma.dog.update({
      where: { id: req.params.id as string },
      data: { views: { increment: 1 } },
    });

    res.json({ success: true, dog: transformDogForFrontend(dog) });
  } catch (error: any) {
    console.error('Get dog by id error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateDog = async (req: AuthRequest, res: Response) => {
  try {
    // Check if dog exists and user owns it
    const existingDog = await prisma.dog.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existingDog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (existingDog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this dog' });
    }

    const {
      name, breed, gender, dateOfBirth, weight, color, description,
      vaccinated, neutered, vetName, vetContact, medicalHistory,
      registered, registrationNumber, registry, sire, dam,
      available, studFee, studFeeNegotiable, previousLitters, temperament,
      address, city, county, postcode, existingImages
    } = req.body;

    console.log('Updating dog with data:', req.body);

    // Calculate age
    const birthDate = new Date(dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    // Handle new image uploads
    const newImages = req.files as Express.Multer.File[];
    const newImageUrls = newImages?.map(file => `/uploads/${file.filename}`) || [];

    // Parse existing images
    let existingImagesArray: string[] = [];
    if (Array.isArray(existingImages)) {
      existingImagesArray = existingImages;
    } else if (typeof existingImages === 'string') {
      try {
        existingImagesArray = JSON.parse(existingImages);
      } catch {
        existingImagesArray = [existingImages];
      }
    }

    // Combine existing and new images
    const allImages = [...existingImagesArray, ...newImageUrls];

    // Parse temperament if it's a string
    let temperamentArray: string[] = [];
    if (Array.isArray(temperament)) {
      temperamentArray = temperament;
    } else if (typeof temperament === 'string') {
      try {
        temperamentArray = JSON.parse(temperament);
      } catch {
        temperamentArray = temperament.split(',').map(t => t.trim());
      }
    }

    const dog = await prisma.dog.update({
      where: { id: req.params.id as string },
      data: {
        name,
        breed,
        gender: gender.toUpperCase() as 'MALE' | 'FEMALE',
        dateOfBirth: new Date(dateOfBirth),
        age,
        weight: parseFloat(weight),
        color,
        description,
        images: allImages,
        mainImage: allImages[0] || null,

        vaccinated: vaccinated === 'true' || vaccinated === true,
        neutered: neutered === 'true' || neutered === true,
        vetName: vetName || null,
        vetContact: vetContact || null,
        medicalHistory: medicalHistory || null,

        registered: registered === 'true' || registered === true,
        registrationNumber: registrationNumber || null,
        registry: registry || null,
        sire: sire || null,
        dam: dam || null,

        available: available === 'true' || available === true,
        studFee: studFee ? parseFloat(studFee) : null,
        studFeeNegotiable: studFeeNegotiable === 'true' || studFeeNegotiable === true,
        previousLitters: previousLitters ? parseInt(previousLitters) : 0,
        temperament: temperamentArray,

        address: address || null,
        city: city || '',
        county: county || '',
        postcode: postcode || null,
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

    console.log('Dog updated successfully:', dog.id);

    res.json({ success: true, dog: transformDogForFrontend(dog) });
  } catch (error: any) {
    console.error('Update dog error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteDog = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await prisma.dog.findUnique({
      where: { id: req.params.id as string },
    });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (dog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this dog' });
    }

    await prisma.dog.delete({
      where: { id: req.params.id as string },
    });

    console.log('Dog deleted successfully:', req.params.id);

    res.json({ success: true, message: 'Dog deleted' });
  } catch (error: any) {
    console.error('Delete dog error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getMyDogs = async (req: AuthRequest, res: Response) => {
  try {
    const dogs = await prisma.dog.findMany({
      where: { ownerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const transformedDogs = dogs.map(transformDogForFrontend);

    res.json({ success: true, dogs: transformedDogs });
  } catch (error: any) {
    console.error('Get my dogs error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const searchNearby = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, city, county, maxDistance = 50 } = req.query;

    // For now, search by city/county
    // You can add PostGIS extension for real geospatial queries later
    const where: any = { status: 'ACTIVE' };

    if (city || county) {
      where.OR = [];
      if (city) {
        where.OR.push({ city: { contains: city as string, mode: 'insensitive' } });
      }
      if (county) {
        where.OR.push({ county: { contains: county as string, mode: 'insensitive' } });
      }
    }

    const dogs = await prisma.dog.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    const transformedDogs = dogs.map(transformDogForFrontend);

    res.json({ success: true, dogs: transformedDogs });
  } catch (error: any) {
    console.error('Search nearby error:', error);
    res.status(500).json({ message: error.message });
  }
};