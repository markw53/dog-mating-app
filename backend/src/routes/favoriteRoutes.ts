import express from 'express';
import { toggleFavorite, getMyFavorites, getMyFavoriteIds } from '../controllers/favoriteController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getMyFavorites);
router.get('/ids', getMyFavoriteIds);
router.post('/:dogId', toggleFavorite);

export default router;
