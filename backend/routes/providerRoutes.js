const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, providerOnly } = require('../middleware/auth');
const {
  getMyProfile,
  updateProfile,
  uploadPhoto,
  uploadDocument,
  submitApplication,
} = require('../controllers/providerController');

router.use(protect, providerOnly);

router.get('/profile', getMyProfile);
router.put('/profile', updateProfile);
router.post('/photo', upload.single('photo'), uploadPhoto);
router.post('/documents', upload.single('document'), uploadDocument);
router.post('/submit', submitApplication);

module.exports = router;
