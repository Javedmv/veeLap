const orderModel = require("../../models/orderModel");
const loadOrder = async (req, res) => {
    try {
        const orders = await orderModel.find({})
            .populate({
                path: "products.productId",
                model: "Product"
            }).populate({
                path: "userId",
                model: "User"
            })
            .exec()
        console.log(orders);
        res.render("admin/orderManagement", { orders })
    } catch (error) {
        console.log(error);
    }
}

const loadOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id
        const order = await orderModel.findOne({ _id: orderId })
            .populate({
                path: "products.productId",
                model: "Product"
            }).populate({
                path: "userId",
                model: "User"
            })
            .exec()
        res.render("admin/orders-detail", { order })
    } catch (error) {
        console.log(error);
    }
}

const changeOrderStatus = async (req, res) => {
    try {
        const { orderStatus, orderId } = req.query
        const order = await orderModel.findById({ _id: orderId })
        if (orderStatus == "Shipped") {
            if (order.orderStatus == "Order Placed") {
                order.orderStatus = orderStatus
            } else {
                return res.status(200).json({ success: false, message: "Please select correct order status", detail: "either the order has already deliver/cancelled" })
            }
        } else if (orderStatus == "Delivered") {
            if (order.orderStatus == "Shipped") {
                order.orderStatus = orderStatus
                order.paymentStatus = "Success"
            } else {
                return res.status(200).json({ success: false, message: "Please select correct order status", detail: "the order has not yet Shipped" })
            }
        } else if (orderStatus == "Cancelled") {
            if (order.orderStatus == "Order Placed" || order.orderStatus == "Shipped") {
                order.orderStatus = orderStatus
            } else {
                return res.status(200).json({ success: false, message: "Please select correct order status", detail: "The order has already Delivered" })
            }
            order.orderStatus = orderStatus
        } else if (orderStatus == "Returned") {
            if (order.orderStatus == "Delivered") {
                order.orderStatus = orderStatus
            } else {
                return res.status(200).json({ success: false, message: "Please select correct order status", detail: "the order has not yet Delivered" })
            }
        } else {
            return res.status(200).json({ success: false, message: "Please select correct order status", detail: "either the order has not yet placed or already deliver/cancelled" })
        }
        await order.save()
        res.status(200).json({ success: true, message: "Order status updated successfully" })
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    loadOrder,
    loadOrderDetails,
    changeOrderStatus
}