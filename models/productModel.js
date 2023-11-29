const mongoose = require("mongoose");

const productModel = mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    modelYear: {
        type: Date,
        required: true
    },
    ramSize: [{
        type: String,
        required: true
    }],
    storage: [{
        type: String,
        required: true
    }],
    operatingSystem: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    salesPrice: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    image: [{
        type: String,
        required: true
    }]

})

module.exports = mongoose.model("Product", productModel)