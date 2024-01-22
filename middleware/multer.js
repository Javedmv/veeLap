const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/uploads'); // Specify the directory where uploaded images will be stored
    },
    filename: function (req, file, cb) {
        // Use Date.now() to make sure the filename is unique
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = {
    upload
}