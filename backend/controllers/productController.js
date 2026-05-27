const Product = require("../models/Product");


// ADD PRODUCT

const addProduct = async (req, res) => {

    try {

        const product = await Product.create(req.body);

        res.status(201).json({
            message: "Product Added Successfully",
            product
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// GET PRODUCTS

const getProducts = async (req, res) => {

    try {

        const products = await Product.find();

        res.status(200).json(products);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// DELETE PRODUCT

const deleteProduct = async (req, res) => {

    try {

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Product Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const updateProduct = async (req, res) => {

    try {

        const updatedProduct =
            await Product.findByIdAndUpdate(

                req.params.id,

                req.body,

                { new: true }

            );

        res.status(200).json({
            message: "Product Updated Successfully",
            updatedProduct
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
};