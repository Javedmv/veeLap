const userModel = require("../../models/userModel");

const loadUser = async (req, res) => {
    try {
        const users = await userModel.find()
        res.render("admin/userManagement", { users })
    } catch (error) {
        console.log(error);
    }
}

const userStatus = async (req, res) => {
    try {
        const { Id } = req.query
        let userData = await userModel.findById({ _id: Id })
        if (userData.status === 'Active') {
            userData.status = "Inactive"
        } else {
            userData.status = "Active"
        }
        await userData.save()
        res.redirect("/admin/view-alluser")
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    loadUser,
    userStatus

}