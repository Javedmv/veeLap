const addressModel = require("../../models/addressModel");
const cartModel = require("../../models/cartModel");
const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");
const orderModel = require("../../models/orderModel")
const { v4: uuidv4 } = require("uuid");
const walletModel = require("../../models/walletModel");
const couponModel = require("../../models/couponModel");
const Razorpay = require('razorpay');
const dotenv = require("dotenv").config()

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env
//instance of razorPay
const instance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET

})


const loadOrderSuccess = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        res.render("user/orderSuccess", { loggedIn })
    } catch (error) {
        console.log(error);
    }
}
const placeOrderCOD = async (req, res) => {
    try {
        let { grandTotal, addressId, discount, couponcode } = req.query
        const loggedIn = req.cookies.loggedIn
        const userData = await userModel.findOne({ email: req.user })
        const userAddress = await addressModel.findOne({ userId: userData._id })
        const userCart = await cartModel.findOne({ userId: userData._id })
            .populate({
                path: "products.productId",
                model: "Product"
            }).exec()
        let orderTotal = 0;//total amount
        let orderProducts = [];
        let totalProductQuantity = 0;
        if (Array.isArray(userCart.products)) {
            userCart.products.forEach(item => {
                if (item.quantity) {
                    totalProductQuantity += item.quantity;
                }
            });
        } else {
            console.error("userCart.products is not an array");
        }

        for (const item of userCart.products) {
            if (item.productId.stock < item.quantity) {
                return res.status(200).json({ codOutOfStock: true })
            }
            let couponAmount;
            if (discount) {
                couponAmount = discount / totalProductQuantity
            }
            const orderedItem = {
                productId: item.productId._id,
                quantity: item.quantity,
                price: (item.productId.salesPrice - item.productId.offerAmount) * item.quantity,
                singleProductStatus: "Order Placed",
                productAmount: Math.trunc(couponAmount * item.quantity) || 0
            }
            await productModel.updateOne({ _id: orderedItem.productId }, { $inc: { stock: -orderedItem.quantity } })
            orderTotal += orderedItem.price
            orderProducts.push(orderedItem)
        }

        if (discount != "undefined") {
            orderTotal -= discount
            await couponModel.updateOne({ couponCode: couponcode }, { $push: { redeemedUser: userData._id } })
        }

        let delAddress;
        userAddress.address.forEach((address) => {
            if (addressId == address._id) {
                delAddress = {
                    addressType: address.addressType,
                    name: address.name,
                    city: address.city,
                    landMark: address.landMark,
                    state: address.state,
                    pincode: address.pincode,
                    phone: address.phone
                }
            }
        })
        const newOrder = await orderModel.create({
            userId: userCart.userId._id,
            products: orderProducts,
            orderDate: Date.now(),
            totalAmount: orderTotal,
            referenceId: uuidv4(),
            orderStatus: "Order Placed",
            paymentStatus: "Pending",
            paymentMethod: "Cash on delivery",
            address: delAddress,
        })
        await newOrder.save()
        await cartModel.updateOne({ userId: userData._id }, { $set: { products: [] } });
        return res.status(200).json({ codOutOfStock: false })

    } catch (error) {
        console.log(error);
    }
}

const walletPayment = async (req, res) => {
    try {
        const userData = await userModel.findOne({ email: req.user })
        const wallet = await walletModel.findOne({ userId: userData._id })
        const { couponCode, grandTotal, discount } = req.query
        const addressId = req.body.addressId
        const loggedIn = req.cookies.loggedIn
        const userAddress = await addressModel.findOne({ userId: userData._id })
        const userCart = await cartModel.findOne({ userId: userData._id })
            .populate({
                path: "products.productId",
                model: "Product"
            }).exec()
        if (wallet.balance > grandTotal - discount || wallet.balance > grandTotal) {

            let orderTotal = 0;//total amount
            let orderProducts = [];
            let totalProductQuantity = 0;
            // total product quantity is taken to split the coupon
            if (Array.isArray(userCart.products)) {
                userCart.products.forEach(item => {
                    if (item.quantity) {
                        totalProductQuantity += item.quantity;
                    }
                });
            } else {
                console.error("userCart.products is not an array");
            }


            for (const item of userCart.products) {
                if (item.productId.stock < item.quantity) {
                    return res.status(200).json({ codOutOfStock: true, walletBalance: false })
                }

                let couponAmount;
                if (discount) {
                    couponAmount = discount / totalProductQuantity
                }

                const orderedItem = {
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: (item.productId.salesPrice - item.productId.offerAmount) * item.quantity,
                    singleProductStatus: "Order Placed",
                    productAmount: Math.trunc(couponAmount * item.quantity) || 0
                }
                await productModel.updateOne({ _id: orderedItem.productId }, { $inc: { stock: -orderedItem.quantity } })
                orderTotal += orderedItem.price
                orderProducts.push(orderedItem)
            }

            if (discount != "undefined") {
                orderTotal -= discount
                await couponModel.updateOne({ couponCode: couponCode }, { $push: { redeemedUser: userData._id } })
            }

            let delAddress;
            userAddress.address.forEach((address) => {
                if (addressId == address._id) {
                    delAddress = {
                        addressType: address.addressType,
                        name: address.name,
                        city: address.city,
                        landMark: address.landMark,
                        state: address.state,
                        pincode: address.pincode,
                        phone: address.phone
                    }
                }
            })
            const newOrder = await orderModel.create({
                userId: userCart.userId._id,
                products: orderProducts,
                orderDate: Date.now(),
                totalAmount: orderTotal,
                referenceId: uuidv4(),
                orderStatus: "Order Placed",
                paymentStatus: "Success",
                paymentMethod: "Wallet",
                address: delAddress,
                returnAmount: orderTotal
            })
            await newOrder.save()
            const walletDetail = {
                walletStatus: "Debited",
                orderTotal,
                referenceId: newOrder.referenceId,
                time: new Date(Date.now()).toLocaleString(),
                walletBalance: wallet.balance - orderTotal
            };
            await walletModel.updateOne({ userId: userData._id }, { $inc: { balance: -orderTotal }, $push: { historyDetails: walletDetail } })
            await cartModel.updateOne({ userId: userData._id }, { $set: { products: [] } });
            return res.status(200).json({ codOutOfStock: false, walletBalance: false })
        } else {
            return res.status(200).json({ walletBalance: true })
        }
    } catch (error) {
        console.log(error);
    }
}

const paymentRazorpay = async (req, res) => {
    try {
        const { addressId, grandTotal, discount, couponCode } = req.body
        const userData = await userModel.findOne({ email: req.user })
        const loggedIn = req.cookies.loggedIn
        const userAddress = await addressModel.findOne({ userId: userData._id })
        const userCart = await cartModel.findOne({ userId: userData._id })
            .populate({
                path: "products.productId",
                model: "Product"
            }).exec()

        let orderTotal = 0;//total amount
        let orderProducts = [];
        let totalProductQuantity = 0;
        if (Array.isArray(userCart.products)) {
            userCart.products.forEach(item => {
                if (item.quantity) {
                    totalProductQuantity += item.quantity;
                }
            });
        } else {
            console.error("userCart.products is not an array");
        }

        for (const item of userCart.products) {
            if (item.productId.stock < item.quantity) {
                return res.status(200).json({ completed: false, onlineOutOfStock: true })
            }

            let couponAmount;
            if (discount) {
                couponAmount = discount / totalProductQuantity
            }

            const orderedItem = {
                productId: item.productId._id,
                quantity: item.quantity,
                price: (item.productId.salesPrice - item.productId.offerAmount) * item.quantity,
                singleProductStatus: "Order Placed",
                productAmount: Math.trunc(couponAmount * item.quantity) || 0
            }
            await productModel.updateOne({ _id: orderedItem.productId }, { $inc: { stock: -orderedItem.quantity } })
            orderTotal += orderedItem.price
            orderProducts.push(orderedItem)
        } 
        let usedCouponId = null;
        if (discount) {
            orderTotal -= discount
            const coupon = await couponModel.findOne({ couponCode: couponCode });
            if (coupon) {
                usedCouponId = coupon._id;
            }
        } else {
            orderTotal = grandTotal
        }

        let delAddress;
        userAddress.address.forEach((address) => {
            if (addressId == address._id) {
                delAddress = {
                    addressType: address.addressType,
                    name: address.name,
                    city: address.city,
                    landMark: address.landMark,
                    state: address.state,
                    pincode: address.pincode,
                    phone: address.phone
                }
            }
        })
        var options = {
            amount: orderTotal * 100,
            currency: "INR",
            receipt: uuidv4(),
            payment_capture: "1",
        };

        const newOrder = await instance.orders.create(options);
        const order = await orderModel.create({
            userId: userCart.userId._id,
            products: orderProducts,
            orderDate: Date.now(),
            totalAmount: orderTotal,
            referenceId: String(newOrder.id),
            orderStatus: "Order Placed",
            paymentStatus: "Pending",
            paymentMethod: "Online payment",
            address: delAddress,
            returnAmount: orderTotal,
            ...(usedCouponId && { couponCode: usedCouponId })
        })
        await order.save()
        res.status(200).json({ completed: true, razorOrderId: newOrder, orderId: order._id })
    } catch (error) {
        console.log(error);
    }
}

const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, razorOrderId, orderId } = req.query
        const userData = await userModel.findOne({ email: req.user })
        await orderModel.findByIdAndUpdate(orderId, {
            paymentStatus
        })
        const order = await orderModel.findById(orderId);

        if (paymentStatus == "Success") {
            await orderModel.updateOne(
                { _id: orderId },
                { $set: { "products.$[].singleProductStatus": "Order Placed" } }
            );

            if (order && order.couponCode) {
                await couponModel.findByIdAndUpdate(
                    order.couponCode,
                    { $addToSet: { redeemedUser: order.userId } }
                );
            }
            await cartModel.updateOne({ userId: userData._id }, { $set: { products: [] } });
            return res.status(200).json({ paymentStatus: "Success" });
        } else {
            if (order) {
                await orderModel.findByIdAndUpdate(orderId, {
                    $set: {
                        'products.$[].singleProductStatus': 'Order Failed'
                    },
                    orderStatus: 'Order Failed',
                    paymentStatus: 'Failed'
                });

                for (const product of order.products) {
                    await productModel.updateOne(
                        { _id: product.productId },
                        { $inc: { stock: product.quantity } }
                    );
                }
                if (order.couponCode) {
                    await couponModel.findByIdAndUpdate(
                        order.couponCode,
                        { $pull: { redeemedUser: order.userId } }
                    );
                }
            }
            return res.status(200).json({ paymentStatus: "Failed" });
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadOrderSuccess,
    placeOrderCOD,
    walletPayment,
    paymentRazorpay,
    updatePaymentStatus
}

