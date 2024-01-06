const adminModel = require("../../models/adminModel");
const jwt = require("jsonwebtoken")
const jwtKey = require("../../config/jwtAdmin")


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
        res.render("admin/dashboard");
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