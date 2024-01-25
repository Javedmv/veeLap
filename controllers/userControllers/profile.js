const { json } = require("body-parser");
const addressModel = require("../../models/addressModel");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const walletModel = require("../../models/walletModel");
const { emit } = require("../../routers/adminRouter");

const loadUserProfile = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        const user = await userModel.findOne({ email: req.user })
        const address = await addressModel.findOne({ userId: user._id })
        const wallet = await walletModel.findOne({ userId: user._id })
        const orders = await orderModel.find({ userId: user._id })
            .populate({
                path: "products.productId",
                model: "Product"
            }).exec()
        res.render("user/userProfile", { loggedIn, user, address, orders, wallet })
    } catch (error) {
        console.log(error);
    }
};

const loadAddAddress = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        const { isCheckout } = req.query
        // console.log(typeof isCheckout);
        if (!isCheckout === "true") {
            isCheckout = null
            // console.log("inside the is checkout");
        }
        res.render("user/addAddress", { loggedIn, isCheckout })
    } catch (error) {
        console.log(error);
    }
};

const submitAddress = async (req, res) => {
    try {
        const { phone, pincode, state, landMark, city, name, addressType } = req.body
        const { isCheckout } = req.query
        // console.log(isCheckout);
        const user = await userModel.findOne({ email: req.user }, { _id: 1 })
        const userAddress = await addressModel.findOne({ userId: user })
        if (!userAddress) {
            const newAddress = new addressModel({
                userId: user,
                address: [{
                    addressType,
                    name,
                    city,
                    landMark,
                    state,
                    pincode,
                    phone
                }]
            })
            await newAddress.save()
        } else {
            userAddress.address.push({
                addressType,
                name,
                city,
                landMark,
                state,
                pincode,
                phone
            })
            await userAddress.save()
            if (isCheckout == "true") {
                // console.log("this is from the cart");
                return res.redirect("/user/checkout")
            } else {
                // console.log("this is from the profile");
                return res.redirect("/user/profile")
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const loadEditAddress = async (req, res) => {
    try {
        const addressId = req.params.id
        const userEmail = req.user
        // const userId = await userModel.findOne({ email: userEmail }, { _id: 1 })
        const address = await addressModel.findOne({ "address._id": addressId }, { address: { $elemMatch: { _id: addressId } } });
        const loggedIn = req.cookies.loggedIn
        res.render("user/editAddress", { loggedIn, address })
    } catch (error) {
        console.log(error);
    }
};

const postEditAddress = async (req, res) => {
    try {
        const { addressType, name, city, landMark, state, pincode, phone } = req.body
        const addressId = req.params.id
        const currAddress = await addressModel.findOne({ "address._id": addressId })
        if (currAddress && currAddress.address) {
            const matchingAddress = currAddress.address.find(
                (item) => item._id == addressId
            )
            if (matchingAddress) {
                await addressModel.updateOne({ "address._id": addressId }, {
                    $set: {
                        "address.$": {
                            addressType,
                            name,
                            city,
                            landMark,
                            state,
                            pincode,
                            phone
                        }
                    }
                })
                    .then(() => {
                        res.redirect("/user/profile")
                    });
            }
            res.redirect("/user/profile")
        } else {
            res.redirect("/user/profile")
        }
    } catch (error) {
        console.log(error);
    }
};

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id
        const userData = await userModel.findOne({ email: req.user })
        const deletedAddress = await addressModel.updateOne({ userId: userData._id }, { $pull: { address: { _id: addressId } } })
        res.redirect("/user/profile")
    } catch (error) {
        console.log(error);
    }
};


const loadOrderDetails = async (req, res) => {
    try {
        const orderRefId = req.query.orderRefId
        const loggedIn = req.cookies.loggedIn
        const orderDetails = await orderModel.findOne({ referenceId: orderRefId })
            .populate({
                path: "products.productId",
                model: "Product"
            })

        res.render("user/orderDetails", { loggedIn, orderDetails })
    } catch (error) {
        console.log(error);
    }
};

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id
        const userData = await userModel.findOne({ email: req.user })
        const userOrder = await orderModel.findOne({ userId: userData._id })
        const wallet = await walletModel.findOne({ userId: userData._id })
        let cancelledOrder = await orderModel.findOne({ _id: orderId })
        // console.log(cancelledOrder.returnAmount, "returnAmount");
        // console.log(cancelledOrder.totalAmount, "thsi is total amount");
        let walletReturn = 0;
        let walletDetail;
        if (cancelledOrder.paymentStatus == "Success") {
            for (let product of cancelledOrder.products) {
                if (product.singleProductStatus != "Cancelled") {
                    walletReturn += product.price - product.productAmount
                }
            }
            walletDetail = {
                walletStatus: "Credited",
                orderTotal: walletReturn,
                referenceId: cancelledOrder.referenceId,
                time: new Date(Date.now()).toLocaleString(),
            }
        }
        for (const item of cancelledOrder.products) {
            if (item.singleProductStatus != "Cancelled") {
                item.singleProductStatus = "Cancelled"
                // console.log(item.productAmount, "thisis productamount");
                await productModel.updateOne({ _id: item.productId }, {
                    $inc: { stock: item.quantity }
                })
            }
        }
        if (walletDetail) {
            walletDetail.walletBalance = wallet.balance + walletReturn
            await walletModel.updateOne({ userId: userData._id }, { $inc: { balance: walletReturn }, $push: { historyDetails: walletDetail } })
        } else {
            await walletModel.updateOne({ userId: userData._id }, { $inc: { balance: walletReturn } })
        }

        await orderModel.updateOne({ _id: orderId }, { $set: { orderStatus: "Cancelled" } })
        cancelledOrder.save()
        res.redirect(`/user/order-status-details?orderRefId=${cancelledOrder.referenceId}`)
    } catch (error) {
        console.log(error);
    }
};

const returnOrder = async (req, res) => {
    try {
        const orderId = req.params.id
        const userData = await userModel.findOne({ email: req.user })
        const userOrder = await orderModel.findOne({ userId: userData._id })
        const returnedOrder = await orderModel.findOne({ _id: orderId })
        await orderModel.updateOne({ _id: orderId }, { $set: { orderStatus: "Returned" } })
        for (const item of returnedOrder.products) {
            await productModel.updateOne({ _id: item.productId }, {
                $inc: { stock: item.quantity }
            })
        }
        if (returnedOrder.paymentStatus == "Success") {
            const wallet = await walletModel.updateOne({ userId: userData._id }, { $inc: { balance: returnedOrder.totalAmount } })
        }
        res.redirect(`/user/order-status-details?orderRefId=${returnedOrder.referenceId}`)
    } catch (error) {
        console.log(error);
    }
};

const singleCancelOrder = async (req, res) => {
    try {
        const { orderId, productStatusId } = req.query;
        const userData = await userModel.findOne({ email: req.user });
        const wallet = await walletModel.findOne({ userId: userData._id });
        const orderData = await orderModel.findOne({ _id: orderId })
            .populate({
                path: "products.productId",
                model: "Product"
            });
        let productUpdated = false;
        let walletDetail;
        for (const product of orderData.products) {
            if (product._id == productStatusId && product.singleProductStatus !== "Cancelled") {
                await orderModel.updateOne(
                    { _id: orderId, "products._id": productStatusId },
                    { $set: { "products.$.singleProductStatus": "Cancelled" } }
                );

                await productModel.findByIdAndUpdate(
                    product.productId._id,
                    { $inc: { stock: product.quantity } }
                );

                if (orderData.paymentStatus == "Success") {
                    walletDetail = {
                        walletStatus: "Credited",
                        orderTotal: product.price - product.productAmount,
                        referenceId: orderData.referenceId,
                        time: new Date(Date.now()).toLocaleString(),
                        walletBalance: wallet.balance + product.price - product.productAmount
                    }
                    await walletModel.findByIdAndUpdate(wallet._id, { $inc: { balance: walletDetail.orderTotal }, $push: { historyDetails: walletDetail } });
                    await orderModel.findByIdAndUpdate(orderId, {
                        $inc: { returnAmount: -(product.price - product.productAmount) }
                    });
                }
                productUpdated = true;
                break;
            }
        }

        await orderData.save()
        const order = await orderModel.findOne({ _id: orderId })
        let allProductsCancelled = order.products.every(product => product.singleProductStatus == "Cancelled");
        if (allProductsCancelled) {
            await orderModel.updateOne({ _id: orderId }, { $set: { orderStatus: "Cancelled" } })
            // console.log("inside all products cancelled");
        }

        if (productUpdated) {
            // console.log("order data saved succesfully");
            await orderData.save();
            return res.status(200).json({ orderRefId: orderData.referenceId });
        } else {
            return res.status(200).json({ cancel: true });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


const submitReferral = async (req, res) => {
    try {
        const referralCode = req.query.refCod
        const user = req.query.email
        const userDate = await userModel.findOne({ email: user })
        const refrerralUser = await userModel.findOne({ ReferralCode: referralCode })
        const wallet = await walletModel.findOne({userId:userDate._id})
        const walletRef = await walletModel.findOne({userId:refrerralUser._id})
        if (refrerralUser) {
            if (userDate.ReferralCode == referralCode) {
                return res.status(200).json({ status: false, message: "Sorry, Wrong Referal Code" })
            } else {
                const walletDetail = {
                    walletStatus: "Credited",
                    orderTotal: 100,
                    referenceId: "Referal",
                    time: new Date(Date.now()).toLocaleString(),
                    walletBalance: wallet.balance + 100
                };
                const refwalletDetail = {
                    walletStatus: "Credited",
                    orderTotal: 200,
                    referenceId: "Referal",
                    time: new Date(Date.now()).toLocaleString(),
                    walletBalance: walletRef.balance + 200
                };
                await walletModel.updateOne({ userId: refrerralUser._id }, { $inc: { balance: 200 },$push:{historyDetails:refwalletDetail} })
                await walletModel.updateOne({ userId: userDate._id }, { $inc: { balance: 100 },$push:{historyDetails:walletDetail} })
                await userModel.updateOne({ email: user }, { ReferralStatus: false })
                const Url = "/user/login"
                res.status(200).json({ status: true, message: "you have won 100 rs" ,Url})
                return res.redirect("/user/")
            }
        } else {
            // console.log("failed");
            return res.status(200).json({ status: false, message: "Sorry, Invalid Referal Code" })
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadUserProfile,
    loadAddAddress,
    submitAddress,
    loadEditAddress,
    postEditAddress,
    deleteAddress,
    loadOrderDetails,
    cancelOrder,
    returnOrder,
    singleCancelOrder,
    submitReferral
}