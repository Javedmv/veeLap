const adminModel = require("../../models/adminModel");
const jwt = require("jsonwebtoken")
const jwtKey = require("../../config/jwtAdmin")
const orderModel = require("../../models/orderModel")
const productModel = require("../../models/productModel")

const loadAdminLogin = async (req, res) => {
    try {
        res.render("admin/adminlogin")
    } catch (error) {
        console.log(error)
    }
};

const verifyAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        const adminData = await adminModel.findOne({ email: email });
        if (adminData) {
            if (adminData.password == password) {
                const token = jwt.sign(email, jwtKey.secretKey)
                res.cookie("tokenadmin", token, { maxAge: 24 * 60 * 60 * 1000 })
                res.cookie("logged", true, { maxAge: 24 * 60 * 60 * 1000 });
                res.redirect("/admin/");
            } else {
                res.render("admin/adminlogin", { message: "invalid password" });
            }
        } else {
            res.render("admin/adminlogin", { message: "invalid Email" });
        }
    } catch (error) {
        console.log(error.message)
    }
};

const loadDashboard = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        .populate({
            path: 'userId',
            model: 'User'
        })
        .sort({ _id: -1 });
        Object.freeze(orders)
        const productLength = await productModel.countDocuments()
        let revenue = 0; 
        orders.forEach(element => {
            if(element.orderStatus != "Cancelled" && element.paymentStatus == "Success"){
            element.returnAmount != 0 ? revenue += element.returnAmount : revenue += element.totalAmount
            }
        });
        res.render("admin/dashboard",{orders,revenue,productLength});
    } catch (error) {
        console.log(error);
    }
};

const adminLogout = async (req, res) => {
    try {
        res.clearCookie("tokenadmin");
        res.clearCookie("logged");
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadAdminLogin,
    verifyAdmin,
    loadDashboard,
    adminLogout
} 