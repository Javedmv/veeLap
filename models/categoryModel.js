const mongoose = require("mongoose");

const categoriesSchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Category", categoriesSchema)