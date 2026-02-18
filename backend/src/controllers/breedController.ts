// src/controllers/breedController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/breeds
export const getAllBreeds = async (req: Request, res: Response) => {
  try {
    const {
      type,
      size,
      page = '1',
      limit = '50',
      sortBy = 'name',
      order = 'asc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (type && type !== 'all') {
      where.type = type as string;
    }

    if (size && size !== 'all') {
      where.size = {
        contains: size as string,
        mode: 'insensitive',
      };
    }

    // Build orderBy
    const validSortFields = ['name', 'type', 'size', 'createdAt'];
    const sortField = validSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : 'name';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const [breeds, total] = await Promise.all([
      prisma.breed.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortField]: sortOrder },
      }),
      prisma.breed.count({ where }),
    ]);

    res.json({
      success: true,
      data: breeds,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breeds',
    });
  }
};

// GET /api/breeds/types
export const getBreedTypes = async (_req: Request, res: Response) => {
  try {
    const types = await prisma.breed.groupBy({
      by: ['type'],
      _count: { type: true },
      orderBy: { type: 'asc' },
    });

    const sizes = await prisma.breed.groupBy({
      by: ['size'],
      _count: { size: true },
      orderBy: { size: 'asc' },
    });

    res.json({
      success: true,
      data: {
        types: types.map((t) => ({
          name: t.type,
          count: t._count.type,
        })),
        sizes: sizes
          .filter((s) => s.size) // filter out nulls
          .map((s) => ({
            name: s.size,
            count: s._count.size,
          })),
      },
    });
  } catch (error) {
    console.error('Error fetching breed types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breed types',
    });
  }
};

// GET /api/breeds/search?q=labrador
export const searchBreeds = async (req: Request, res: Response) => {
  try {
    const { q, limit = '20' } = req.query;

    if (!q || (q as string).trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
      return;
    }

    const searchTerm = (q as string).trim();
    const limitNum = Math.min(parseInt(limit as string), 50);

    const breeds = await prisma.breed.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { type: { contains: searchTerm, mode: 'insensitive' } },
          { kennelClubCategory: { contains: searchTerm, mode: 'insensitive' } },
          { temperament: { contains: searchTerm, mode: 'insensitive' } },
          { searchKeywords: { has: searchTerm.toLowerCase() } },
        ],
      },
      take: limitNum,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: breeds,
      total: breeds.length,
    });
  } catch (error) {
    console.error('Error searching breeds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search breeds',
    });
  }
};

// GET /api/breeds/:slug
export const getBreedBySlug = async (req: Request, res: Response) => {
  try {
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

    if (!slug) {
      res.status(400).json({
        success: false,
        message: 'Breed slug is required',
      });
      return;
    }

    const breed = await prisma.breed.findUnique({
      where: { slug },
      
      include: {
        dogs: {
          where: { status: 'ACTIVE' },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            gender: true,
            age: true,
            mainImage: true,
            city: true,
            county: true,
            available: true,
          },
        },
      },
    });

    if (!breed) {
      res.status(404).json({
        success: false,
        message: 'Breed not found',
      });
      return;
    }

    res.json({
      success: true,
      data: breed,
    });
  } catch (error) {
    console.error('Error fetching breed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breed',
    });
  }
};