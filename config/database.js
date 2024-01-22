const dotenv = require("dotenv").config();

module.exports = {
    url: `${process.env.DB_HOST}${process.env.DB_NAME}`
}