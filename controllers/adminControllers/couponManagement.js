const couponModel = require("../../models/couponModel");

const loadCouponManagement = async (req, res) => {
    try {
        const coupons = await couponModel.find({})
        res.render("admin/couponAdmin", { coupons })
    } catch (error) {
        console.log(error);
    }
}

const loadAddCoupon = async (req, res) => {
    try {
        res.render("admin/addCoupon")
    } catch (error) {
        console.log(error);
    }
}

const loadEditCoupon = async (req, res) => {
    try {
        const couponId = req.params.id
        let coupon = await couponModel.findOne({ _id: couponId })
        res.render("admin/editCoupon", { coupon })
    } catch (error) {
        console.log(error);
    }
}

const addNewCoupon = async (req, res) => {
    try {
        const { couponCode, description, discountAmount, minimumPurchase, status, expiryDate } = req.body
        await couponModel.create({
            couponCode,
            description,
            discountAmount,
            minimumPurchase,
            expiryDate,
            status,
        })
        res.redirect("/admin/coupon-management")

    } catch (error) {
        console.log(error);
    }
}

const unblockCoupon = async (req, res) => {
    try {
        const couponId = req.query.couponId
        const coupon = await couponModel.updateOne({ _id: couponId }, { $set: { status: "Unblock" } })
        res.redirect("/admin/coupon-management")
    } catch (error) {

    }
}
const blockCoupon = async (req, res) => {
    try {
        const couponId = req.query.couponId
        const coupon = await couponModel.updateOne({ _id: couponId }, { $set: { status: "Block" } })
        res.redirect("/admin/coupon-management")
    } catch (error) {

    }
}

const postEditCoupon = async (req, res) => {
    try {
        const couponId = req.params.id
        const { couponCode, description, discountAmount, minimumPurchase, status, expiryDate } = req.body
        const coupon = await couponModel.updateOne({ _id: couponId }, {
            $set: {
                couponCode,
                description,
                discountAmount,
                minimumPurchase,
                expiryDate,
                status
            }
        })
        console.log(coupon);
        res.redirect("/admin/coupon-management")
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    loadCouponManagement,
    loadAddCoupon,
    loadEditCoupon,
    addNewCoupon,
    unblockCoupon,
    blockCoupon,
    postEditCoupon
}