// routes/upload.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

// GET /api/upload/signature
router.get('/signature', protect, isAdmin, async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Include folder in signature for better organization
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        upload_preset: 'jomo_auto_products',
        folder: 'jomo-auto-parts'
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature'
    });
  }
});

// DELETE /api/upload/:publicId
router.delete('/:publicId', protect, isAdmin, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

module.exports = router;