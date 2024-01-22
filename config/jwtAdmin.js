const dotenv = require("dotenv").config()

module.exports = {
    secretKey: `${dotenv.JWT_SECRET_KEY_ADMIN}`
}