// src/routes/breedRoutes.ts
import { Router } from 'express';
import {
  getAllBreeds,
  getBreedBySlug,
  getBreedTypes,
  searchBreeds,
} from '../controllers/breedController';

const router = Router();

// GET /api/breeds - list all breeds with filtering & pagination
router.get('/', getAllBreeds);

// GET /api/breeds/types - get all breed type categories
router.get('/types', getBreedTypes);

// GET /api/breeds/search - search breeds by keyword
router.get('/search', searchBreeds);

// GET /api/breeds/:slug - get single breed by slug
router.get('/:slug', getBreedBySlug);

export default router;