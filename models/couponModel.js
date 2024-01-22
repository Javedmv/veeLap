const { default: mongoose } = require("mongoose");

const couponModel = mongoose.Schema({
    redeemedUser: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    couponCode: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discountAmount: {
        type: Number,
        required: true,
    },
    minimumPurchase: {
        type: Number,
        required: true,
    },
    expiryDate: {
        type: Date,
    },
    status: {
        type: String,
        default: "Unblock"
    },
})

module.exports = mongoose.model("Coupon", couponModel)