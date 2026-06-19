const Category = require('../models/Category');

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });
    const category = await Category.create({ name, description });
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL CATEGORIES with optional pagination/search
const getCategories = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "50", 10), 1);
    const search = req.query.search || "";

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };

    const total = await Category.countDocuments(filter);
    const categories = await Category.find(filter).skip((page - 1) * limit).limit(limit);

    res.status(200).json({ data: categories, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: 'Category updated', category: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
