const offerModel = require("../../models/offerModel");

const loadOfferManagement = async (req, res) => {
    try {
        const offers = await offerModel.find({});
        res.render("admin/offerManagement")
    } catch (error) {
        console.log(error);
    }
}

const loadAddOffer = async (req, res) => {
    try {
        res.render("admin/addOffer")
    } catch (error) {
        console.log(error);
    }
}

const addOffer = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    loadOfferManagement,
    loadAddOffer,
    addOffer
}