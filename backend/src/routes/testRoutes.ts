import express from 'express';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/test-upload', upload.single('image'), (req, res) => {
  try {
    console.log('Test upload - File received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      success: true,
      file: req.file,
      url: `/uploads/${req.file.filename}`,
      fullUrl: `http://localhost:5000/uploads/${req.file.filename}`
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;