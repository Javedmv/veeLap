const jwt = require("jsonwebtoken");
const jwtKey = require("../config/jwt");
const userModel = require("../models/userModel");

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    const verifyToken = jwt.verify(token, jwtKey.secretKey, (err, decoded) => {                  // jwt key is from .env file
        if (err) {
            res.redirect("/user/login")
        }
        req.user = decoded;
        next()
    }
    )
};

const checkBlockedStatus = async (req, res, next) => {
    try {
        if (req.user) {
            const user = req.user
            const currUser = await userModel.findOne({ email: user })
            if (currUser.status == "Inactive") {
                res.clearCookie("token");
                res.clearCookie("loggedIn");
                res.clearCookie("userEmail");
                return res.render("user/login", { error: "User is blocked" })
            }
        }
        next();
    } catch (error) {
        // Handle the error appropriately, e.g., log it or send a 500 response
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    verifyUser,
    checkBlockedStatus
}