const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const util = require('util');
const Photo = require('../models/Photo');
const Order = require('../models/Order');
const googleIntegration = require('../services/googleIntegration');

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
router.post('/upload/:orderId', upload.array('photos', 10), async (req, res) => {
  const orderId = req.params.orderId;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const createPhoto = util.promisify(Photo.create.bind(Photo));
  const uploadedPhotos = [];
  const driveLinks = [];
  const driveErrors = [];

  try {
    for (const file of req.files) {
      const filePath = `/uploads/${file.filename}`;
      const photoId = await createPhoto(orderId, filePath);
      uploadedPhotos.push({
        id: photoId,
        file_path: filePath,
        uploaded_at: new Date()
      });

      try {
        const localFilePath = path.join(__dirname, '../uploads', file.filename);
        const uploadedFile = await googleIntegration.uploadFileToDrive(localFilePath, file.originalname, file.mimetype);
        driveLinks.push(uploadedFile.webViewLink || uploadedFile.webContentLink);
      } catch (driveError) {
        console.error('Google Drive upload error:', driveError.message);
        driveErrors.push(driveError.message);
      }
    }

    Order.getById(orderId, async (orderErr, order) => {
      let googleSync = null;

      if (!orderErr && order && driveLinks.length > 0) {
        try {
          googleSync = await googleIntegration.syncOrderToSheet(order, driveLinks);
        } catch (syncError) {
          console.error('Google sheet update error:', syncError.message);
          googleSync = { success: false, message: syncError.message };
        }
      }

      const uploadSuccess = driveErrors.length === 0;
      const responsePayload = {
        success: uploadSuccess,
        message: uploadSuccess
          ? `${uploadedPhotos.length} photo(s) uploaded successfully`
          : `${uploadedPhotos.length} photo(s) uploaded locally, but ${driveErrors.length} photo(s) failed to upload to Google Drive.`,
        photos: uploadedPhotos,
        driveLinks,
        googleSync
      };

      if (driveErrors.length > 0) {
        responsePayload.driveErrors = driveErrors;
        responsePayload.error = driveErrors.join('; ');
      }

      res.status(201).json(responsePayload);
    });
  } catch (err) {
    console.error('Error saving photo:', err);
    res.status(500).json({ error: 'Error processing photo upload', details: err.message });
  }
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