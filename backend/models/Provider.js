const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: { type: String, default: '' },
    categories: [{ type: String }],
    skills: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    profilePhoto: { type: String, default: '' },
    documents: [
      {
        docType: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['incomplete', 'pending', 'approved', 'rejected'],
      default: 'incomplete',
    },
    rejectionRemark: { type: String, default: '' },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Provider', providerSchema);
