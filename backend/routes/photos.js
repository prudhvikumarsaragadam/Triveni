const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Photo = require('../models/Photo');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload photos for an order
router.post('/upload/:orderId', upload.array('photos', 10), (req, res) => {
  const orderId = req.params.orderId;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const uploadedPhotos = [];
  let errorOccurred = false;
  let processedCount = 0;

  // Save each photo to database
  req.files.forEach(file => {
    const filePath = `/uploads/${file.filename}`;

    Photo.create(orderId, filePath, (err, photoId) => {
      processedCount += 1;

      if (err) {
        console.error('Error saving photo:', err);
        if (!errorOccurred) {
          errorOccurred = true;
          return res.status(500).json({ error: 'Error saving photo' });
        }
        return;
      }

      uploadedPhotos.push({
        id: photoId,
        file_path: filePath,
        uploaded_at: new Date()
      });

      if (!errorOccurred && processedCount === req.files.length) {
        res.status(201).json({
          success: true,
          message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
          photos: uploadedPhotos
        });
      }
    });
  });
});

// Get photos for an order
router.get('/order/:orderId', (req, res) => {
  const orderId = req.params.orderId;

  Photo.getByOrderId(orderId, (err, photos) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(photos);
  });
});

// Delete a photo
router.delete('/:photoId', (req, res) => {
  const photoId = req.params.photoId;

  Photo.delete(photoId, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Photo deleted successfully' });
  });
});

// Get all photos
router.get('/', (req, res) => {
  Photo.getAll((err, photos) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(photos);
  });
});

module.exports = router;