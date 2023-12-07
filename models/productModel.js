const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const productModel = mongoose.Schema({
    brand: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    modelYear: {
        type: Number,
        required: true,
    },
    ramSize:
    {
        type: String,
        required: true,
    },
    storage:
    {
        type: String,
        required: true,
    },

    operatingSystem: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    detailedDescription: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    regularPrice: {
        type: Number,
        required: true,
    },
    salesPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "Active",
    },
    images: [
        {
            path: {
                type: String,
                required: true,
            },
        },
    ],
});

module.exports = mongoose.model("Product", productModel);
