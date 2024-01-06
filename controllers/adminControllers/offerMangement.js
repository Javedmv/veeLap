const offerModel = require("../../models/offerModel");
const productModel = require("../../models/productModel");

const loadOfferManagement = async (req, res) => {
    try {
        const offerData = await offerModel.find({}).
            populate({
                path: "productId",
                model: "Product"
            }).exec()
        res.render("admin/offerManagement", { offerData })
    } catch (error) {
        console.log(error);
    }
}

const loadAddOffer = async (req, res) => {
    try {
        const productData = await productModel.find()
        res.render("admin/addOffer", { productData })
    } catch (error) {
        console.log(error);
    }
}

const addOfferSubmit = async (req, res) => {
    try {
        const { offerType, productId, discountPercentage, status, startDate, endDate } = req.body
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        let expired;

        if (startDate >= endDate) {
            expired = true;
        }
        let startDateObj = new Date(startDate);
        const existingOffer = await offerModel.findOne({ productId })
            .populate({
                path: "productId",
                model: "Product"
            })

        if (existingOffer) {
            return res.status(400).json({ error: "An offer with the product already exists" })
        } else if (expired) {
            return res.status(400).json({ error: "Expiry date should be less than starting Date" });
        } else if (startDateObj < currentDate) {
            return res.status(400).json({ error: "Start date must be in the future" });
        } else if (endDate < currentDate) {
            return res.status(400).json({ error: "End date must be in the future" });
        } else {
            const newOffer = new offerModel({
                offerType,
                productId: Object(productId),
                discountPercentage,
                status,
                startDate,
                endDate
            })
            await newOffer.save()
            const product = await productModel.findOne({ _id: productId })

            await productModel.findByIdAndUpdate(productId, {
                $set: {
                    offerStart: startDateObj,
                    offerEnd: new Date(endDate),
                    discountPercent: discountPercentage,
                    discountStatus: status,
                    offerAmount: Math.round(product.salesPrice * (discountPercentage / 100))
                },
            })
            res.status(200).json({ message: "Offer data received successfully" });
        }
    } catch (error) {
        console.log(error);
    }
}

const blockOffer = async (req, res) => {
    try {
        const offerId = req.params.id
        const offer = await offerModel.findOne({ _id: offerId })
        const product = await productModel.findByIdAndUpdate(offer.productId, { $set: { discountStatus: "Inactive" } })
        offer.status = "Inactive"
        offer.save()
        res.redirect("/admin/view-offer-management")
    } catch (error) {
        console.log(error);
    }
}

const unblockOffer = async (req, res) => {
    try {
        const offerId = req.params.id
        const offer = await offerModel.findOne({ _id: offerId })
        const product = await productModel.findByIdAndUpdate(offer.productId, { $set: { discountStatus: "Active" } })
        offer.status = "Active"
        offer.save()
        res.redirect("/admin/view-offer-management")
    } catch (error) {
        console.log(error);
    }
}

const loadEditOffer = async (req, res) => {
    try {
        const offerId = req.params.id
        const offerData = await offerModel.findOne({ _id: offerId })
            .populate({
                path: "productId",
                model: "Product"
            })
        res.render("admin/editOffer", { offerData })
    } catch (error) {
        console.log(error);
    }
}

const postEditOffer = async (req, res) => {
    try {
        const { offerId, offerType, productId, discountPercentage, status, startDate, endDate } = req.body
        const offerData = await offerModel.findOne({ _id: offerId })
            .populate({
                path: "productId",
                model: "Product"
            })
            .exec()
        const discountStatus = status === "Unblock" ? "Active" : "Inactive";
        offerData.discountPercentage = discountPercentage
        offerData.status = discountStatus
        offerData.startDate = startDate
        offerData.endDate = endDate
        await offerData.save()

        await productModel.findByIdAndUpdate(productId, {
            $set: {
                discountStatus: discountStatus,
                discountPercent: discountPercentage,
                offerStart: startDate,
                offerEnd: endDate,
                offerAmount: Math.round(offerData.productId.salesPrice * (discountPercentage / 100))
            }
        })
        res.status(200).json({ message: "Offer Status Updated Successfully" })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadOfferManagement,
    loadAddOffer,
    addOfferSubmit,
    blockOffer,
    unblockOffer,
    loadEditOffer,
    postEditOffer
}