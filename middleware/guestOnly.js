const jwt = require("jsonwebtoken");
const jwtKey = require("../config/jwt");

const guestOnly = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return next();

    jwt.verify(token, jwtKey.secretKey, (err, decoded) => {
        if (err) {
            return next(); // token invalid, proceed to login
        }
        // already logged in, redirect
        return res.redirect("/");
    });
};

module.exports = guestOnly;
