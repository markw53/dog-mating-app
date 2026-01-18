import { Response } from 'express';
import Dog from '../models/Dog';
import { AuthRequest } from '../middleware/auth';

export const createDog = async (req: AuthRequest, res: Response) => {
  try {
    const dogData = {
      ...req.body,
      owner: req.user!._id
    };

    const dog = await Dog.create(dogData);
    res.status(201).json({ success: true, dog });
  } catch (error: any) {
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
      state,
      available,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query: any = { status: 'active' };

    if (breed) query.breed = new RegExp(breed as string, 'i');
    if (gender) query.gender = gender;
    if (city) query['location.city'] = new RegExp(city as string, 'i');
    if (state) query['location.state'] = new RegExp(state as string, 'i');
    if (available === 'true') query['breeding.available'] = true;
    
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = Number(minAge);
      if (maxAge) query.age.$lte = Number(maxAge);
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const dogs = await Dog.find(query)
      .populate('owner', 'firstName lastName avatar location')
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum);

    const total = await Dog.countDocuments(query);

    res.json({
      success: true,
      dogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDogById = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await Dog.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone avatar location');

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    // Increment views
    dog.views += 1;
    await dog.save();

    res.json({ success: true, dog });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDog = async (req: AuthRequest, res: Response) => {
  try {
    let dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    // Check ownership
    if (dog.owner.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this dog' });
    }

    dog = await Dog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, dog });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDog = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    // Check ownership
    if (dog.owner.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this dog' });
    }

    await dog.deleteOne();
    res.json({ success: true, message: 'Dog deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDogs = async (req: AuthRequest, res: Response) => {
  try {
    const dogs = await Dog.find({ owner: req.user!._id }).sort('-createdAt');
    res.json({ success: true, dogs });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const searchNearby = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, maxDistance = 50 } = req.query; // maxDistance in miles

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    // Convert miles to meters for MongoDB
    const maxDistanceMeters = Number(maxDistance) * 1609.34;

    const dogs = await Dog.find({
      status: 'active',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: maxDistanceMeters
        }
      }
    }).populate('owner', 'firstName lastName avatar');

    res.json({ success: true, dogs });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};