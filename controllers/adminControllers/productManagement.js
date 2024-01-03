const productModel = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel")
const upload = require("../../middleware/multer");
const { json } = require("body-parser");
const { default: mongoose } = require("mongoose");
const sharp = require("sharp");
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
        console.log(req.files, "------------------------thisi si th efile of images----------------------");
        console.log(req.body, "this is the body");
        const { brand, productName, modelYear, ramSize, storage, operatingSystem,
            fullDescription, detailedDescription, category, stock, regularPrice, salesPrice, status } = req.body
        // console.log(category);
        console.log(status);
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
            console.log("image added success");
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
            }) //  the field is named 'category' in your product schema
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
            })//  the field is named 'category' in your product schema
            .exec()
        // console.log(product.category);
        // const categoryColl = await categoryModel.find();
        res.render("admin/editproduct", { product })
    } catch (error) {
        console.log(error);
    }
};

const deleteSingleImage = async (req, res) => {
    try {
        const { productId, SingleImgId } = req.query;
        // Update the document to pull the image
        const kss = await productModel.updateOne({ _id: productId }, { $pull: { images: { _id: SingleImgId } } });
        // console.log(kss);
        const product = await productModel.findById({ _id: productId })
            .populate({
                path: 'category', model: 'Category'
            })//  the field is named 'category' in your product schema
            .exec()
        const categoryColl = await categoryModel.find();
        res.render("admin/editproduct", { product, categoryColl })
    } catch (error) {
        console.log(error);
    }
}

const editAddImage = async (req, res) => {
    try {
        const productId = req.params.id

    } catch (error) {
        console.log(error);
    }
};

const editSubmitProduct = async (req, res) => {
    try {
        // console.log("hello");
        const productId = req.params.id
        const { brand, productName, modelYear, ramSize, storage, operatingSystem,
            fullDescription, category, stock, regularPrice, salesPrice, status, detailedDescription } = req.body
        console.log(req.body);
        if (req.files) {
            const productImg = req.files
            let imgArr = [];
            const product = await productModel.findOne({ _id: productId });
            imgArr.push(...product.images)
            for (const elements of productImg) {
                const filePath = `/uploads/${elements.originalname}`;
                imgArr.push({ path: filePath });
            }

            const existingCategory = await categoryModel.findOne({ categoryName: category })

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
            console.log("edit product added successfully");
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

        // Check if the product exists
        if (product) {
            // Delete the associated images
            const imageIds = product.images.map(image => image._id);
            await productModel.updateOne({ _id: product.Id }, { $pull: { images: { _id: { $in: imageIds } } } });
            // Delete the product itself
            await productModel.deleteOne({ _id: product._id });
            // console.log(`Product with ID ${productId} and associated images deleted successfully.`);
            return res.status(200).json({ message: "Deleted Successfully" })
        }
        res.redirect("/admin/view-all-products")
        // console.log("completeed");
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
    editAddImage,
    editSubmitProduct,
    deleteProduct
}