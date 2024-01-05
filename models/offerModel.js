const mongoose = require("mongoose")

const offerModel = new mongoose.Schema({
    offerName: {
        type: String,
        required: true,
    },
    offerType: {
        type: String,
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
    isActive: {
        type: Boolean,
        default: true,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("Offer", offerModel)