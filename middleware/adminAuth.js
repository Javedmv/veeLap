const jwt = require("jsonwebtoken")
const jwtKey = require("../config/jwtAdmin")

const verifyAdminToken = async (req, res, next) => {
    const token = req.cookies.tokenadmin
    const verifyToken = jwt.verify(token, jwtKey.secretKey, (err, decoded) => {
        if (err) {
            res.redirect("/admin/login")
        }
        req.user = decoded
        next()
    })
}

module.exports = {
    verifyAdminToken
}