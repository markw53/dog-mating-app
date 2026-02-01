import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import axios from 'axios';

// Geocoding function using OpenStreetMap Nominatim
async function geocodeAddress(
  city?: string, 
  postcode?: string, 
  country: string = 'UK'
): Promise<{ lat: number; lng: number } | null> {
  try {
    if (!city && !postcode) return null;
    
    const query = [postcode, city, country].filter(Boolean).join(', ');
    
    console.log(`Geocoding: ${query}`);
    
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'User-Agent': 'DogMate-App/1.0'
        }
      }
    );
    
    if (response.data && response.data.length > 0) {
      console.log(`✅ Geocoded successfully: ${response.data[0].lat}, ${response.data[0].lon}`);
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    
    console.log(`❌ No geocoding results for: ${query}`);
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
}

// Helper function to format dog response
function formatDogResponse(dog: any) {
  return {
    ...dog,
    location: {
      address: dog.address,
      city: dog.city,
      state: dog.county,
      zipCode: dog.postcode,
      country: dog.country,
      coordinates: dog.latitude && dog.longitude ? {
        lat: dog.latitude,
        lng: dog.longitude
      } : undefined
    },
    breeding: {
      available: dog.available,
      fee: dog.studFee,
      feeNegotiable: dog.studFeeNegotiable,
      previousLitters: dog.previousLitters,
    },
    health: {
      vaccinated: dog.vaccinated,
      neutered: dog.neutered,
      vetName: dog.vetName,
      vetContact: dog.vetContact,
      medicalHistory: dog.medicalHistory,
    },
    pedigree: {
      registered: dog.registered,
      registrationNumber: dog.registrationNumber,
      registry: dog.registry,
      sire: dog.sire,
      dam: dog.dam,
    }
  };
}

// Helper function to convert degrees to radians
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Create a new dog
export const createDog = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      breed,
      gender,
      dateOfBirth,
      weight,
      color,
      description,
      city,
      county,
      postcode,
      address,
      country,
      vaccinated,
      neutered,
      vetName,
      vetContact,
      medicalHistory,
      registered,
      registrationNumber,
      registry,
      sire,
      dam,
      available,
      studFee,
      studFeeNegotiable,
      previousLitters,
      temperament,
      images,
      mainImage,
      latitude,
      longitude,
    } = req.body;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

    let coords = null;
    if (latitude && longitude) {
      coords = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    } else {
      coords = await geocodeAddress(city, postcode, country || 'UK');
    }

    const dog = await prisma.dog.create({
      data: {
        name,
        breed,
        gender: gender.toUpperCase(),
        dateOfBirth: new Date(dateOfBirth),
        age,
        weight: parseFloat(weight),
        color,
        description,
        city,
        county,
        postcode,
        address,
        country: country || 'UK',
        latitude: coords?.lat,
        longitude: coords?.lng,
        vaccinated: vaccinated === 'true' || vaccinated === true,
        neutered: neutered === 'true' || neutered === true,
        vetName,
        vetContact,
        medicalHistory,
        registered: registered === 'true' || registered === true,
        registrationNumber,
        registry,
        sire,
        dam,
        available: available === 'true' || available === true,
        studFee: studFee ? parseFloat(studFee) : null,
        studFeeNegotiable: studFeeNegotiable === 'true' || studFeeNegotiable === true,
        previousLitters: previousLitters ? parseInt(previousLitters) : 0,
        temperament: Array.isArray(temperament) ? temperament : [],
        images: Array.isArray(images) ? images : [],
        mainImage: mainImage || null,
        ownerId: req.user!.id,
        status: 'PENDING',
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            city: true,
            county: true,
          },
        },
      },
    });

    res.status(201).json({ 
      success: true, 
      dog: formatDogResponse(dog)
    });
  } catch (error: any) {
    console.error('Create dog error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all dogs
export const getAllDogs = async (req: Request, res: Response) => {
  try {
    const { 
      breed, 
      gender, 
      minAge, 
      maxAge, 
      city, 
      available, 
      status,
      page = '1',
      limit = '20'
    } = req.query;

    const where: any = {};

    if (status) {
      where.status = (status as string).toUpperCase();
    } else {
      where.status = 'ACTIVE';
    }

    if (breed) where.breed = { contains: breed as string, mode: 'insensitive' };
    if (gender) where.gender = (gender as string).toUpperCase();
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (available !== undefined) where.available = available === 'true';

    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = parseInt(minAge as string);
      if (maxAge) where.age.lte = parseInt(maxAge as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [dogs, total] = await Promise.all([
      prisma.dog.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              city: true,
              county: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.dog.count({ where }),
    ]);

    const formattedDogs = dogs.map(formatDogResponse);

    res.json({ 
      success: true, 
      dogs: formattedDogs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error: any) {
    console.error('Get dogs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single dog
export const getDogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
            city: true,
            county: true,
            avatar: true,
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

    res.json({ 
      success: true, 
      dog: formatDogResponse(dog)
    });
  } catch (error: any) {
    console.error('Get dog error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get my dogs
export const getMyDogs = async (req: AuthRequest, res: Response) => {
  try {
    const dogs = await prisma.dog.findMany({
      where: { ownerId: req.user!.id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedDogs = dogs.map(formatDogResponse);

    res.json({ success: true, dogs: formattedDogs });
  } catch (error: any) {
    console.error('Get my dogs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update dog
export const updateDog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingDog = await prisma.dog.findUnique({ where: { id } });

    if (!existingDog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (existingDog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let age = existingDog.age;
    if (updateData.dateOfBirth && updateData.dateOfBirth !== existingDog.dateOfBirth.toISOString()) {
      const birthDate = new Date(updateData.dateOfBirth);
      const today = new Date();
      age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }

    let coords = { lat: existingDog.latitude, lng: existingDog.longitude };

    if (updateData.latitude && updateData.longitude) {
      coords = { lat: parseFloat(updateData.latitude), lng: parseFloat(updateData.longitude) };
    } else if (
      updateData.city !== existingDog.city || 
      updateData.postcode !== existingDog.postcode || 
      !existingDog.latitude || 
      !existingDog.longitude
    ) {
      const newCoordinates = await geocodeAddress(
        updateData.city || existingDog.city, 
        updateData.postcode || existingDog.postcode, 
        updateData.country || existingDog.country
      );
      if (newCoordinates) coords = newCoordinates;
    }

    const updatedDog = await prisma.dog.update({
      where: { id },
      data: {
        ...updateData,
        age,
        latitude: coords.lat,
        longitude: coords.lng,
        gender: updateData.gender ? updateData.gender.toUpperCase() : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ success: true, dog: formatDogResponse(updatedDog) });
  } catch (error: any) {
    console.error('Update dog error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete dog
export const deleteDog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dog = await prisma.dog.findUnique({ where: { id } });

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (dog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.dog.delete({ where: { id } });

    res.json({ success: true, message: 'Dog deleted successfully' });
  } catch (error: any) {
    console.error('Delete dog error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Search dogs
export const searchDogs = async (req: Request, res: Response) => {
  try {
    const { query, ...filters } = req.query;

    const where: any = { status: 'ACTIVE' };

    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { breed: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } },
      ];
    }

    const dogs = await prisma.dog.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({ success: true, dogs: dogs.map(formatDogResponse) });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Search nearby dogs
export const searchNearby = async (req: Request, res: Response) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = '50',
      breed,
      gender,
      available,
      page = '1',
      limit = '20'
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);

    const where: any = { 
      status: 'ACTIVE',
      latitude: { not: null },
      longitude: { not: null }
    };

    if (breed) where.breed = { contains: breed as string, mode: 'insensitive' };
    if (gender) where.gender = (gender as string).toUpperCase();
    if (available !== undefined) where.available = available === 'true';

    const allDogs = await prisma.dog.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            city: true,
            county: true,
          },
        },
      },
    });

    const dogsWithDistance = allDogs
      .map(dog => {
        if (!dog.latitude || !dog.longitude) return null;

        const R = 6371;
        const dLat = toRad(dog.latitude - lat);
        const dLon = toRad(dog.longitude - lng);
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat)) * Math.cos(toRad(dog.latitude)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return { ...dog, distance: Math.round(distance * 10) / 10 };
      })
      .filter(dog => dog !== null && dog.distance <= radiusKm)
      .sort((a, b) => a!.distance - b!.distance);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedDogs = dogsWithDistance.slice(startIndex, startIndex + limitNum);

    res.json({ 
      success: true, 
      dogs: paginatedDogs.map(dog => ({ ...formatDogResponse(dog), distance: dog.distance })),
      pagination: {
        total: dogsWithDistance.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(dogsWithDistance.length / limitNum),
      }
    });
  } catch (error: any) {
    console.error('Search nearby error:', error);
    res.status(500).json({ message: error.message });
  }
};