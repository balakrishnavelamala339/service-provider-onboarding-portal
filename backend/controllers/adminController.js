const Provider = require('../models/Provider');

// @route GET /api/admin/providers
exports.listProviders = async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (status && status !== 'all') filter.status = status;

  let query = Provider.find(filter).populate('user', 'name email');

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Provider.countDocuments(filter);

  let providers = await query.sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

  if (search) {
    const term = search.toLowerCase();
    providers = providers.filter(
      (p) =>
        p.user.name.toLowerCase().includes(term) ||
        p.user.email.toLowerCase().includes(term) ||
        p.skills.some((s) => s.toLowerCase().includes(term)) ||
        p.location.city.toLowerCase().includes(term)
    );
  }

  res.json({
    providers,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
};

// @route GET /api/admin/providers/:id
exports.getProvider = async (req, res) => {
  const provider = await Provider.findById(req.params.id).populate('user', 'name email');
  if (!provider) return res.status(404).json({ message: 'Provider not found' });
  res.json(provider);
};

// @route PUT /api/admin/providers/:id/approve
exports.approveProvider = async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) return res.status(404).json({ message: 'Provider not found' });
  if (provider.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending applications can be approved' });
  }
  provider.status = 'approved';
  provider.rejectionRemark = '';
  await provider.save();
  res.json(provider);
};

// @route PUT /api/admin/providers/:id/reject
exports.rejectProvider = async (req, res) => {
  const { remark } = req.body;
  if (!remark || !remark.trim()) {
    return res.status(400).json({ message: 'A rejection remark is required' });
  }
  const provider = await Provider.findById(req.params.id);
  if (!provider) return res.status(404).json({ message: 'Provider not found' });
  if (provider.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending applications can be rejected' });
  }
  provider.status = 'rejected';
  provider.rejectionRemark = remark;
  await provider.save();
  res.json(provider);
};

// @route GET /api/admin/stats
exports.getStats = async (req, res) => {
  const [total, pending, approved, rejected, incomplete] = await Promise.all([
    Provider.countDocuments(),
    Provider.countDocuments({ status: 'pending' }),
    Provider.countDocuments({ status: 'approved' }),
    Provider.countDocuments({ status: 'rejected' }),
    Provider.countDocuments({ status: 'incomplete' }),
  ]);
  res.json({ total, pending, approved, rejected, incomplete });
};
