import { Response } from 'express';
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

// Helper function to convert degrees to radians
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Helper function to transform dog data for frontend
const transformDogForFrontend = (dog: any) => {
  return {
    ...dog,
    _id: dog.id,
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
      coordinates: dog.latitude && dog.longitude ? {
        lat: dog.latitude,
        lng: dog.longitude
      } : undefined
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
      address, city, county, postcode, country,
      latitude, longitude
    } = req.body;

    console.log('Creating dog with data:', req.body);
    console.log('Files received:', req.files);

    const birthDate = new Date(dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    const files = req.files as Express.Multer.File[];
    const imageUrls = files?.map(file => `/uploads/${file.filename}`) || [];

    let temperamentArray: string[] = [];
    if (Array.isArray(temperament)) {
      temperamentArray = temperament;
    } else if (typeof temperament === 'string') {
      try {
        temperamentArray = JSON.parse(temperament);
      } catch {
        temperamentArray = temperament.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    // Geocode address if coordinates not provided
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
        gender: gender.toUpperCase() as 'MALE' | 'FEMALE',
        dateOfBirth: new Date(dateOfBirth),
        age,
        weight: parseFloat(weight),
        color,
        description,
        images: imageUrls,
        mainImage: imageUrls[0] || null,

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
        country: country || 'UK',
        
        // Add coordinates
        latitude: coords?.lat,
        longitude: coords?.lng,

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
    console.log('Coordinates:', coords);

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

    const total = await prisma.dog.count({ where });

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
      address, city, county, postcode, existingImages,
      latitude, longitude
    } = req.body;

    const birthDate = new Date(dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    const newImages = req.files as Express.Multer.File[];
    const newImageUrls = newImages?.map(file => `/uploads/${file.filename}`) || [];

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

    const allImages = [...existingImagesArray, ...newImageUrls];

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

    // Update coordinates if location changed
    let coords = {
      lat: existingDog.latitude,
      lng: existingDog.longitude
    };

    if (latitude && longitude) {
      coords = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    } else if (
      city !== existingDog.city || 
      postcode !== existingDog.postcode || 
      !existingDog.latitude || 
      !existingDog.longitude
    ) {
      const newCoordinates = await geocodeAddress(
        city || existingDog.city, 
        postcode || existingDog.postcode
      );
      if (newCoordinates) {
        coords = newCoordinates;
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
        
        latitude: coords.lat,
        longitude: coords.lng,
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
    const { 
      latitude,
      longitude,
      lat, 
      lng, 
      city, 
      county, 
      radius = '50',
      breed,
      gender,
      available 
    } = req.query;

    // Use either latitude/longitude or lat/lng
    const searchLat = latitude || lat;
    const searchLng = longitude || lng;

    const where: any = { 
      status: 'ACTIVE',
      latitude: { not: null },
      longitude: { not: null }
    };

    if (breed) where.breed = { contains: breed as string, mode: 'insensitive' };
    if (gender) where.gender = (gender as string).toUpperCase();
    if (available !== undefined) where.available = available === 'true';

    // If coordinates provided, calculate distance
    if (searchLat && searchLng) {
      const userLat = parseFloat(searchLat as string);
      const userLng = parseFloat(searchLng as string);
      const radiusKm = parseFloat(radius as string);

      const allDogs = await prisma.dog.findMany({
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
      });

      // Calculate distance using Haversine formula
      const dogsWithDistance = allDogs
        .map(dog => {
          if (!dog.latitude || !dog.longitude) return null;

          const R = 6371; // Earth's radius in km
          const dLat = toRad(dog.latitude - userLat);
          const dLon = toRad(dog.longitude - userLng);
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(userLat)) * Math.cos(toRad(dog.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return {
            ...dog,
            distance: Math.round(distance * 10) / 10
          };
        })
        .filter((dog): dog is NonNullable<typeof dog> => dog !== null && dog.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

      const transformedDogs = dogsWithDistance.map(dog => ({
        ...transformDogForFrontend(dog),
        distance: dog.distance
      }));

      return res.json({ success: true, dogs: transformedDogs });
    }

    // Fallback to city/county search
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