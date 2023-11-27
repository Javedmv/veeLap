const admin = require("../../models/adminModel");

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
        const adminData = await admin.findOne({ email: email });
        console.log(adminData)
        if (adminData) {
            if (adminData.password == password) {
                res.redirect("/admin/dashboard");
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






module.exports = {
    loadAdminLogin,
    verifyAdmin,
    loadDashboard
} 