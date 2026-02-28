const { body } = require('express-validator');
const Client = require('../models/Client');
const { createAuditLog } = require('../utils/auditLogger');

const clientValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('notes').optional().isString(),
];

async function getClients(req, res, next) {
  try {
    const { search } = req.query;
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const clients = await Client.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    return res.json(clients);
  } catch (err) {
    return next(err);
  }
}

async function getClientById(req, res, next) {
  try {
    const client = await Client.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    return res.json(client);
  } catch (err) {
    return next(err);
  }
}

async function createClient(req, res, next) {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      notes: req.body.notes,
      createdBy: req.user._id,
    };
    const client = await Client.create(payload);

    await createAuditLog({
      userId: req.user._id,
      action: 'create',
      entity: 'Client',
      entityId: client._id,
    });

    return res.status(201).json(client);
  } catch (err) {
    return next(err);
  }
}

async function updateClient(req, res, next) {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      notes: req.body.notes,
    };
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'update',
      entity: 'Client',
      entityId: client._id,
    });

    return res.json(client);
  } catch (err) {
    return next(err);
  }
}

async function deleteClient(req, res, next) {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'delete',
      entity: 'Client',
      entityId: client._id,
    });

    return res.json({ message: 'Client deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  clientValidation,
};

