const mongoose = require("mongoose")
const walletModel = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        requried: true
    },
    balance: {
        type: Number,
        default: 0,
    }
})

module.exports = mongoose.model("Wallet", walletModel)