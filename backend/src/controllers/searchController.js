const Case = require('../models/Case');
const Client = require('../models/Client');
const Document = require('../models/Document');

function buildCaseFilterForUser(user) {
  if (user.role === 'Admin') return {};
  if (user.role === 'Attorney') {
    return { assignedAttorney: user._id };
  }
  if (user.role === 'Assistant') {
    return { assistants: user._id };
  }
  return {};
}

async function globalSearch(req, res, next) {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const regex = new RegExp(q, 'i');

    const caseFilter = {
      ...buildCaseFilterForUser(req.user),
      title: regex,
    };

    const [cases, clients, documents] = await Promise.all([
      Case.find(caseFilter).limit(5).select('title'),
      Client.find({ name: regex }).limit(5).select('name'),
      Document.find({ name: regex }).limit(5).select('name caseId'),
    ]);

    const results = [
      ...cases.map(c => ({
        type: 'case',
        id: c._id,
        label: c.title,
      })),
      ...clients.map(c => ({
        type: 'client',
        id: c._id,
        label: c.name,
      })),
      ...documents.map(d => ({
        type: 'document',
        id: d._id,
        label: d.name,
      })),
    ];

    return res.json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = { globalSearch };