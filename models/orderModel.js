const mongoose = require("mongoose")
const userModel = require("./userModel")

const orderModel = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            singleProductStatus: {
                type: String,
                enum: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned", "Order Failed"],
                default: "Order Placed"
            },
            //this is the coupon applied amount
            productAmount: {
                type: Number,
                default: 0
            }
        }
    ],
    orderDate: {
        type: Date,
        default: Date.now
    },
    totalAmount: {
        type: Number,
        required: true
    },
    referenceId: {
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned", "Order Failed"],
        default: "Order Placed"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Success", "Failed"],
        default: "Pending",
    },
    paymentMethod: {
        type: String,
        required: true,
    }, address: {
        type: Object,
        ref: "Address",
        required: true
    },
    returnAmount: {
        type: Number,
    },
    couponCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon"
    }
},
    { timestamps: true }
)
module.exports = mongoose.model("Order", orderModel)