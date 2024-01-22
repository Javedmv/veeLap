const productModel = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel")
const upload = require("../../middleware/multer");
const { json } = require("body-parser");
const { default: mongoose } = require("mongoose");
const sharp = require("sharp");
const offerModel = require("../../models/offerModel");
// const { ObjectId } = require("mongoose").Types;


const loadAddProducts = async (req, res) => {
    try {
        const categoryColl = await categoryModel.find()
        res.render("admin/addproduct", { categoryColl })
    } catch (error) {
        console.log(error);
    }
}

const addProduct = async (req, res) => {
    try {
        const { brand, productName, modelYear, ramSize, storage, operatingSystem,
            fullDescription, detailedDescription, category, stock, regularPrice, salesPrice, status } = req.body
        if (req.files) {
            const prductImg = req.files
            let imageArr = [];
            for (let i = 0; i < prductImg.length; i++) {
                const croppedImage = await sharp(prductImg[i].path)
                    .resize({
                        width: 750,
                        height: 750,
                        channels: 4,
                        background: { r: 255, g: 0, b: 0, alpha: 0.5 }
                    })
                    .toBuffer()
                const filename = `cropped_${prductImg[i].filename}`;
                const filePath = `public/uploads/${filename}`;
                await sharp(croppedImage).toFile(filePath);

                imageArr.push({
                    fileName: filename,
                    originalname: prductImg[i].originalname,
                    path: `/uploads/${filename}`,
                });
            }
            await productModel.create({
                brand: brand,
                productName: productName,
                modelYear: modelYear,
                ramSize: ramSize,
                storage: storage,
                operatingSystem: operatingSystem,
                description: fullDescription,
                detailedDescription: detailedDescription,
                stock: stock,
                category: category,
                regularPrice: regularPrice,
                salesPrice: salesPrice,
                status: status || "Active",
                images: imageArr,
            })
        }
        res.status(200).json({ productAdded: true })
    } catch (error) {
        console.log(error);
    }
};

const loadProduct = async (req, res) => {
    try {
        const product = await productModel.find({})
            .populate({
                path: 'category',
                model: 'Category'
            })
            .exec();
        res.render("admin/productsManagement", { product })
    } catch (error) {
        console.log(error);
    }
};

const loadEditProducts = async (req, res) => {
    try {
        const prdctId = req.params.id
        const product = await productModel.findById({ _id: prdctId })
            .populate({
                path: 'category', model: 'Category'
            })
            .exec()
        res.render("admin/editproduct", { product, error: null })
    } catch (error) {
        console.log(error);
    }
};

const deleteSingleImage = async (req, res) => {
    try {
        const { productId, SingleImgId } = req.query;
        await productModel.updateOne({ _id: productId }, { $pull: { images: { _id: SingleImgId } } });
        const product = await productModel.findById({ _id: productId })
            .populate({
                path: 'category', model: 'Category'
            })
            .exec()
        const categoryColl = await categoryModel.find();
        res.render("admin/editproduct", { product, categoryColl, error: null })
    } catch (error) {
        console.log(error);
    }
}


const editSubmitProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const { brand, productName, modelYear, ramSize, storage, operatingSystem,
            fullDescription, category, stock, regularPrice, salesPrice, status, detailedDescription } = req.body
        if (req.files) {
            let imgArr = [];
            const alreadyImage = await productModel.findOne({ _id: productId })
            console.log(alreadyImage, "this is the already");
            imgArr.push(...alreadyImage.images)
            console.log(imgArr);
            const productImg = req.files
            for (let i = 0; i < productImg.length; i++) {
                const croppedImage = await sharp(productImg[i].path)
                    .resize({
                        width: 750,
                        height: 750,
                        channels: 4,
                        background: { r: 255, g: 0, b: 0, alpha: 0.5 }
                    })
                    .toBuffer()
                const filename = `cropped_${productImg[i].filename}`;
                const filePath = `public/uploads/${filename}`;
                await sharp(croppedImage).toFile(filePath);



                imgArr.push({
                    fileName: filename,
                    originalname: productImg[i].originalname,
                    path: `/uploads/${filename}`,
                });
            }
            const existingCategory = await categoryModel.findOne({ categoryName: category })
            console.log(imgArr.length);
            if (imgArr.length < 2) {
                res.render("admin/editproduct", { error: "Atleast 2 images should be added", product: alreadyImage })
            } else {
                await productModel.updateOne({ _id: productId }, {
                    $set: {
                        brand: brand,
                        productName: productName,
                        modelYear: modelYear,
                        ramSize: ramSize,
                        storage: storage,
                        operatingSystem: operatingSystem,
                        description: fullDescription,
                        detailedDescription,
                        stock: stock,
                        category: existingCategory._id,
                        regularPrice: regularPrice,
                        salesPrice: salesPrice,
                        status: status,
                        images: imgArr,
                    }
                })
            }
            console.log("edit product added successfully");
            const lee = await productModel.findOne({ _id: productId }, { images: 1 })
            console.log(lee);
        }
        res.redirect("/admin/view-all-products")
    } catch (error) {
        console.log(error);
    }
}


const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await productModel.findOne({ _id: productId });

        if (product) {
            const imageIds = product.images.map(image => image._id);
            await productModel.updateOne({ _id: product.Id }, { $pull: { images: { _id: { $in: imageIds } } } });
            await productModel.deleteOne({ _id: product._id });
            await offerModel.deleteOne({ productId: product._id })
            return res.status(200).json({ message: "Deleted Successfully" })
        }
        res.redirect("/admin/view-all-products")
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    loadAddProducts,
    addProduct,
    loadProduct,
    loadEditProducts,
    deleteSingleImage,
    editSubmitProduct,
    deleteProduct
}