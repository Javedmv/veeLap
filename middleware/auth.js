const User = require("../models/userModel");

const isUser = async (req, res, next) => {
    try {
        if (req.session.User) {
            next()
        } else {
            res.render("user/Login")
        }
    } catch (error) {

    }
};
