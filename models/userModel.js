const mongoose = require("mongoose");

const userModel = mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "Active"
    },
    ReferralCode: {
        type: String
    },
    redeemedReferral: {
        type: Array
    },
    ReferralStatus: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model("User", userModel)