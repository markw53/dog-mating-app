// controllers/matchingController.ts
import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateMatchScore } from '../services/matchingService';
import { Gender, Status } from '@prisma/client';

export const findMatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 findMatches called');
    console.log('   User:', req.user?.id, req.user?.email);
    console.log('   Params:', req.params);
    console.log('   Query:', req.query);

    const dogId = req.params.dogId as string;
    const { limit = '10', minScore = '30' } = req.query;

    if (!dogId || Array.isArray(dogId)) {
      console.log('   ❌ Invalid dog ID');
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

    console.log('   Looking for dog:', dogId);

    const sourceDog = await prisma.dog.findUnique({
      where: { id: dogId },
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

    if (!sourceDog) {
      console.log('   ❌ Dog not found');
      return res.status(404).json({ message: 'Dog not found' });
    }

    console.log('   ✅ Dog found:', sourceDog.name, 'Owner:', sourceDog.ownerId);

    // Check ownership or admin
    if (sourceDog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      console.log('   ❌ Not authorized. Dog owner:', sourceDog.ownerId, 'User:', req.user!.id);
      return res.status(403).json({ message: 'Not authorized to view matches for this dog' });
    }

    console.log('   ✅ Authorization passed');

    const oppositeGender = sourceDog.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
    console.log('   Looking for opposite gender:', oppositeGender);

    const potentialMatches = await prisma.dog.findMany({
      where: {
        AND: [
          { id: { not: dogId } },
          { ownerId: { not: sourceDog.ownerId } },
          { status: Status.ACTIVE },
          { available: true },
          { gender: oppositeGender },
          { neutered: false },
        ],
      },
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

    console.log('   📊 Found potential matches:', potentialMatches.length);

    const matches = potentialMatches
      .map(dog => {
        const matchScore = calculateMatchScore(
          {
            breed: sourceDog.breed,
            gender: sourceDog.gender,
            age: sourceDog.age,
            location:
              sourceDog.latitude && sourceDog.longitude
                ? { latitude: sourceDog.latitude, longitude: sourceDog.longitude }
                : undefined,
            temperament: sourceDog.temperament,
            healthStatus: {
              vaccinated: sourceDog.vaccinated,
              neutered: sourceDog.neutered,
            },
          },
          {
            breed: dog.breed,
            gender: dog.gender,
            age: dog.age,
            location:
              dog.latitude && dog.longitude
                ? { latitude: dog.latitude, longitude: dog.longitude }
                : undefined,
            temperament: dog.temperament,
            healthStatus: {
              vaccinated: dog.vaccinated,
              neutered: dog.neutered,
            },
          }
        );

        return {
          dog: {
            id: dog.id,
            _id: dog.id,
            name: dog.name,
            breed: dog.breed,
            gender: dog.gender.toLowerCase(),
            dateOfBirth: dog.dateOfBirth,
            age: dog.age,
            weight: dog.weight,
            color: dog.color,
            description: dog.description,
            images: dog.images,
            mainImage: dog.mainImage,
            vaccinated: dog.vaccinated,
            neutered: dog.neutered,
            vetName: dog.vetName,
            vetContact: dog.vetContact,
            medicalHistory: dog.medicalHistory,
            registered: dog.registered,
            registrationNumber: dog.registrationNumber,
            registry: dog.registry,
            sire: dog.sire,
            dam: dog.dam,
            temperament: dog.temperament,
            status: dog.status.toLowerCase(),
            views: dog.views,
            favorites: dog.favorites,
            ownerId: dog.ownerId,
            createdAt: dog.createdAt,
            updatedAt: dog.updatedAt,
            location: {
              city: dog.city,
              state: dog.county,
              zipCode: dog.postcode,
              country: dog.country,
              coordinates:
                dog.latitude && dog.longitude
                  ? { lat: dog.latitude, lng: dog.longitude }
                  : undefined,
            },
            breeding: {
              available: dog.available,
              studFee: dog.studFee,
              studFeeNegotiable: dog.studFeeNegotiable,
              previousLitters: dog.previousLitters,
            },
            owner: dog.owner,
          },
          matchScore: matchScore.score,
          matchReasons: matchScore.reasons,
          distance: matchScore.distance,
        };
      })
      .filter(match => match.matchScore >= parseInt(minScore as string))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit as string));

    console.log('   ✅ Returning', matches.length, 'matches after filtering');

    res.json({
      success: true,
      sourceDog: {
        id: sourceDog.id,
        name: sourceDog.name,
        breed: sourceDog.breed,
        gender: sourceDog.gender.toLowerCase(),
        age: sourceDog.age,
      },
      matches,
      total: matches.length,
    });
  } catch (error) {
    console.error('❌ Find matches error:', error);
    next(error);
  }
};

export const getMatchStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('📈 getMatchStats called');
    console.log('   User:', req.user?.id);
    console.log('   Params:', req.params);
    
    const dogId = req.params.dogId as string;

    if (!dogId || Array.isArray(dogId)) {
      console.log('   ❌ Invalid dog ID');
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

    const sourceDog = await prisma.dog.findUnique({
      where: { id: dogId },
    });

    if (!sourceDog) {
      console.log('   ❌ Dog not found');
      return res.status(404).json({ message: 'Dog not found' });
    }

    console.log('   ✅ Dog found:', sourceDog.name);

    if (sourceDog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      console.log('   ❌ Not authorized');
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oppositeGender = sourceDog.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;

    const baseWhere = {
      gender: oppositeGender,
      status: Status.ACTIVE,
      available: true,
      neutered: false,
      id: { not: dogId },
      ownerId: { not: sourceDog.ownerId },
    };

    const [totalPotential, sameBreed, nearbyCount] = await Promise.all([
      prisma.dog.count({ where: baseWhere }),
      prisma.dog.count({ where: { ...baseWhere, breed: sourceDog.breed } }),
      sourceDog.latitude && sourceDog.longitude
        ? prisma.dog.count({
            where: {
              ...baseWhere,
              latitude: { not: null },
              longitude: { not: null },
            },
          })
        : 0,
    ]);

    console.log('   ✅ Stats:', { totalPotential, sameBreed, nearbyCount });

    res.json({
      success: true,
      stats: {
        totalPotential,
        sameBreed,
        nearby: nearbyCount,
        breedCompatibility: totalPotential > 0 ? Math.round((sameBreed / totalPotential) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('❌ Get match stats error:', error);
    next(error);
  }
};