const mongoose = require("mongoose")

const offerModel = new mongoose.Schema({
    offerType: {
        type: String,
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        default: "Inactive"
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("Offer", offerModel)