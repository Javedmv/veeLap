const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const admin_Router = express();
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
    loadDashboard

} = require("../controllers/adminControllers/adminController")

const { loadCategory, addCategory, editCategory, loadEditCategory, statusCategory, deleteCategory } = require("../controllers/adminControllers/categoryManagement")
const { loadUser, userStatus } = require("../controllers/adminControllers/userManagement");
const { loadAddProducts, addProduct, loadProduct, loadEditProducts, deleteSingleImage, editAddImage, editSubmitProduct, deleteProduct } = require("../controllers/adminControllers/productManagement");

admin_Router.get("/login", loadAdminLogin);
admin_Router.post("/verify-admin", verifyAdmin);
admin_Router.get("/", loadDashboard);

// category
admin_Router.get("/view-allcategory", loadCategory);
admin_Router.post("/add-category", addCategory);
admin_Router.get("/edit-category/:id", loadEditCategory);
admin_Router.post("/post-edit-category/:id", editCategory);
admin_Router.get("/status-category", statusCategory);
admin_Router.get("/delete-category/:id", deleteCategory);

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
admin_Router.get("/edit-add-image/:id", editAddImage);
admin_Router.post("/edit-submit-product/:id", upload.array("productImages", 3), editSubmitProduct);
admin_Router.get("/delete-product/:id", deleteProduct)

module.exports = admin_Router
