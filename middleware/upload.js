// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // Check extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

// Single image upload
exports.uploadSingle = upload.single('image');

// Multiple images upload (max 5)
exports.uploadMultiple = upload.array('images', 5);

// Upload fields (for forms with multiple file inputs)
exports.uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'avatar', maxCount: 1 }
]);