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
    },
    historyDetails: [
        {
            type: Object,
        }
    ],
})

module.exports = mongoose.model("Wallet", walletModel)  