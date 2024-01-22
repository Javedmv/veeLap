const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const admin_Router = express();
const { verifyAdminToken } = require("../middleware/adminAuth")
// const { upload } = require('../middleware/multer')
// const session = require("express-session");

const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

const {
    loadAdminLogin,
    verifyAdmin,
    loadDashboard,
    adminLogout

} = require("../controllers/adminControllers/adminController")
const { loadCategory, addCategory, editCategory, loadEditCategory, statusCategory, deleteCategory } = require("../controllers/adminControllers/categoryManagement")
const { loadUser, userStatus } = require("../controllers/adminControllers/userManagement");
const { loadAddProducts, addProduct, loadProduct, loadEditProducts, deleteSingleImage, editSubmitProduct, deleteProduct } = require("../controllers/adminControllers/productManagement");
const { loadOrder, loadOrderDetails, changeOrderStatus } = require("../controllers/adminControllers/orderManagement")
const { loadCouponManagement, loadAddCoupon, loadEditCoupon, addNewCoupon, unblockCoupon, blockCoupon, postEditCoupon } = require("../controllers/adminControllers/couponManagement")
const { loadOfferManagement, loadAddOffer, addOfferSubmit, unblockOffer, blockOffer, loadEditOffer, postEditOffer } = require("../controllers/adminControllers/offerMangement")

admin_Router.get("/login", loadAdminLogin);
admin_Router.post("/verify-admin", verifyAdmin);

admin_Router.use(verifyAdminToken)

admin_Router.get("/", loadDashboard);
admin_Router.get("/logout", adminLogout)

// category
admin_Router.get("/view-allcategory", loadCategory);
admin_Router.post("/add-category", addCategory);
admin_Router.get("/edit-category/:id", loadEditCategory);
admin_Router.post("/post-edit-category", editCategory);
admin_Router.get("/status-category", statusCategory);
admin_Router.delete("/delete-category/:id", deleteCategory);

// user Management
admin_Router.get("/view-alluser", loadUser);
admin_Router.get("/user-status", userStatus);

//product
admin_Router.get("/view-all-products", loadProduct)


//add products
admin_Router.get("/view-add-product", loadAddProducts);
admin_Router.post("/add-product", upload.array("productImages", 3), addProduct);
admin_Router.get("/edit-product/:id", loadEditProducts);
admin_Router.get("/edit-delete-image", deleteSingleImage);
admin_Router.post("/edit-submit-product/:id", upload.array("productImages", 3), editSubmitProduct);
admin_Router.delete("/delete-product/:id", deleteProduct);


//order Management
admin_Router.get("/view-all-orders", loadOrder)
admin_Router.get("/order/details-page/:id", loadOrderDetails)
admin_Router.get("/change-order-status", changeOrderStatus)

//coupon Management
admin_Router.get("/coupon-management", loadCouponManagement)
admin_Router.get("/add-coupon", loadAddCoupon)
admin_Router.get("/edit-coupon/:id", loadEditCoupon)
admin_Router.post("/add-coupon", addNewCoupon)
admin_Router.get("/block-coupon", blockCoupon)
admin_Router.get("/unblock-coupon", unblockCoupon)
admin_Router.post("/edit-post-coupon/:id", postEditCoupon)

//offer Management
admin_Router.get("/view-offer-management", loadOfferManagement)
admin_Router.get("/load-add-product", loadAddOffer)
admin_Router.post("/postadd-offer", addOfferSubmit)
admin_Router.get("/block-offer/:id", blockOffer)
admin_Router.get("/unblock-offer/:id", unblockOffer)
admin_Router.get("/load-edit-offer/:id", loadEditOffer)
admin_Router.post("/postEdit-offer", postEditOffer)

module.exports = admin_Router
