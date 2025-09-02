const cartModel = require("../../models/cartModel")
const wishlistModel = require("../../models/wishlistModel");
const userModel = require("../../models/userModel");

const getCounts = async (req, res) => {
  try {
    const isLoggedIn = req.cookies.isLoggedIn === "true";

    if (!isLoggedIn) {
      return res.json({ cartCount:0, wishlistCount:0 });
    }

    const userEmail = req.cookies.userEmail;
    const userData = await userModel.findOne({ email: userEmail });

    const cart = await cartModel.findOne({ userId: userData._id });
    const wishlist = await wishlistModel.findOne({ userId: userData._id });

    const cartCount = cart ? cart.products.length : 0;
    const wishlistCount = wishlist ? wishlist.products.length : 0;

    res.json({ cartCount, wishlistCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch counts" });
  }
};

module.exports = { getCounts };
