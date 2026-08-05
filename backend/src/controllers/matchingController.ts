import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { calculateMatchScore, calculateDistance } from '../services/matchingService';
import { ageInYears } from '../utils/age';
import { Gender, Status } from '@prisma/client';
import logger from '../utils/logger';
import { parsePagination, parseIntSafe } from '../utils/pagination';

export const findMatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dogId = req.params.dogId as string;
    const { limit, minScore } = req.query;
    // parsePagination floors limit at 1 and caps it, so negative/garbage
    // values can't reach Array.slice as a negative index
    const { limit: limitNum } = parsePagination(undefined, limit, { defaultLimit: 10, maxLimit: 50 });
    const minScoreNum = parseIntSafe(minScore, 30);

    if (!dogId || Array.isArray(dogId)) {
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

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
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (sourceDog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view matches for this dog' });
    }

    const oppositeGender = sourceDog.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;

    // Select only what the scorer and the match cards consume — the full row
    // (description, medical history, vet contacts, pedigree) is dead weight
    // multiplied by every candidate in the pool
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
      select: {
        id: true,
        name: true,
        breed: true,
        gender: true,
        dateOfBirth: true,
        age: true,
        images: true,
        mainImage: true,
        vaccinated: true,
        neutered: true,
        temperament: true,
        status: true,
        available: true,
        studFee: true,
        studFeeNegotiable: true,
        previousLitters: true,
        city: true,
        county: true,
        postcode: true,
        country: true,
        latitude: true,
        longitude: true,
        ownerId: true,
        createdAt: true,
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

    const sourceAge = ageInYears(sourceDog.dateOfBirth);

    const matches = potentialMatches
      .map((dog) => {
        const matchScore = calculateMatchScore(
          {
            breed: sourceDog.breed,
            gender: sourceDog.gender,
            age: sourceAge,
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
            age: ageInYears(dog.dateOfBirth),
            location:
              dog.latitude && dog.longitude
                ? { latitude: dog.latitude, longitude: dog.longitude }
                : undefined,
            temperament: dog.temperament,
            healthStatus: {
              vaccinated: dog.vaccinated,
              neutered: dog.neutered,
            },
          },
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
            images: dog.images,
            mainImage: dog.mainImage,
            vaccinated: dog.vaccinated,
            neutered: dog.neutered,
            temperament: dog.temperament,
            status: dog.status.toLowerCase(),
            ownerId: dog.ownerId,
            createdAt: dog.createdAt,
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
      .filter((match) => match.matchScore >= minScoreNum)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limitNum);

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
    logger.error({ err: error }, 'Find matches error');
    next(error);
  }
};

export const getMatchStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dogId = req.params.dogId as string;

    if (!dogId || Array.isArray(dogId)) {
      return res.status(400).json({ message: 'Invalid dog ID' });
    }

    const sourceDog = await prisma.dog.findUnique({ where: { id: dogId } });

    if (!sourceDog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    if (sourceDog.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
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

    const NEARBY_RADIUS_KM = 50;

    const [totalPotential, sameBreed, candidateCoords] = await Promise.all([
      prisma.dog.count({ where: baseWhere }),
      prisma.dog.count({ where: { ...baseWhere, breed: sourceDog.breed } }),
      sourceDog.latitude && sourceDog.longitude
        ? prisma.dog.findMany({
            where: {
              ...baseWhere,
              latitude: { not: null },
              longitude: { not: null },
            },
            select: { latitude: true, longitude: true },
          })
        : Promise.resolve([]),
    ]);

    // "Nearby" means actually within radius, not merely "has coordinates"
    const nearbyCount = candidateCoords.filter(
      (c) =>
        calculateDistance(
          sourceDog.latitude!,
          sourceDog.longitude!,
          c.latitude!,
          c.longitude!,
        ) <= NEARBY_RADIUS_KM,
    ).length;

    res.json({
      success: true,
      stats: {
        totalPotential,
        sameBreed,
        nearby: nearbyCount,
        breedCompatibility:
          totalPotential > 0 ? Math.round((sameBreed / totalPotential) * 100) : 0,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Get match stats error');
    next(error);
  }
};
