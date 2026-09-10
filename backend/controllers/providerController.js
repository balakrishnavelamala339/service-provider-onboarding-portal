const Provider = require('../models/Provider');

// @route GET /api/provider/profile
exports.getMyProfile = async (req, res) => {
  const profile = await Provider.findOne({ user: req.user._id }).populate('user', 'name email');
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
};

// @route PUT /api/provider/profile
exports.updateProfile = async (req, res) => {
  const profile = await Provider.findOne({ user: req.user._id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  if (profile.status === 'approved') {
    return res.status(400).json({ message: 'Approved profiles cannot be edited' });
  }

  const { phone, categories, skills, experienceYears, location } = req.body;

  if (phone !== undefined) profile.phone = phone;
  if (categories !== undefined) profile.categories = categories;
  if (skills !== undefined) profile.skills = skills;
  if (experienceYears !== undefined) profile.experienceYears = experienceYears;
  if (location !== undefined) profile.location = { ...profile.location.toObject(), ...location };

  if (profile.status === 'rejected') {
    profile.status = 'incomplete';
    profile.rejectionRemark = '';
  }

  await profile.save();
  res.json(profile);
};

// @route POST /api/provider/photo
exports.uploadPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const profile = await Provider.findOne({ user: req.user._id });
  profile.profilePhoto = `/uploads/${req.file.filename}`;
  await profile.save();
  res.json({ profilePhoto: profile.profilePhoto });
};

// @route POST /api/provider/documents
exports.uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const { docType } = req.body;
  const profile = await Provider.findOne({ user: req.user._id });

  profile.documents.push({
    docType: docType || 'Other',
    fileUrl: `/uploads/${req.file.filename}`,
  });
  await profile.save();
  res.json(profile.documents);
};

// @route POST /api/provider/submit
exports.submitApplication = async (req, res) => {
  const profile = await Provider.findOne({ user: req.user._id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  if (!profile.categories.length || !profile.location.city || !profile.profilePhoto) {
    return res.status(400).json({
      message: 'Complete your profile (categories, location, profile photo) before submitting',
    });
  }
  if (!profile.documents.length) {
    return res.status(400).json({ message: 'Upload at least one verification document' });
  }

  profile.status = 'pending';
  profile.submittedAt = new Date();
  await profile.save();
  res.json(profile);
};
