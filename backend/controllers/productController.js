const Product = require("../models/Product");

// ADD PRODUCT
const addProduct = async (req, res) => {
    try {
        const { name, category, price, stock } = req.body;
        if (!name || !category || price === undefined) {
            return res.status(400).json({ message: "name, category and price are required" });
        }

        const product = await Product.create({ name, category, price, stock: stock || 0, ...req.body });

        res.status(201).json({ message: "Product Added Successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET PRODUCTS with pagination & search
const getProducts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const limit = Math.max(parseInt(req.query.limit || "20", 10), 1);
        const search = req.query.search || "";
        const category = req.query.category;
        const status = req.query.status;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { barcode: { $regex: search, $options: "i" } }
            ];
        }
        if (category) filter.category = category;
        if (status) filter.status = status;

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category', 'name')
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        res.status(200).json({ data: products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, category, price } = req.body;
        if (name === '' || category === '' || price === '') {
            return res.status(400).json({ message: 'Invalid fields' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(200).json({ message: "Product Updated Successfully", updatedProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addProduct, getProducts, deleteProduct, updateProduct };