const Customer = require('../models/Customer');

// CREATE CUSTOMER
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const customer = await Customer.create({ name, phone, email });
    res.status(201).json({ message: 'Customer created', customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CUSTOMERS (paginated)
const getCustomers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const search = req.query.search || '';

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };

    const total = await Customer.countDocuments(filter);
    const data = await Customer.find(filter).skip((page - 1) * limit).limit(limit);
    res.status(200).json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: 'Customer updated', customer: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer };
