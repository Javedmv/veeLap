const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel")
const mongoose = require('mongoose');

const filterAndSort = async (req, res) => {
    try {
        let products;
        const ObjectId = mongoose.Types.ObjectId;
        let { sort, categories } = req.body;
        const loggedIn = req.cookies.loggedIn;
        const userEmail = req.cookies.userEmail;
        const page = parseInt(req.query.page) || 1;
        const no_doc_on_each_pages = 9;
        const skip = (page - 1) * no_doc_on_each_pages;

        // Make sure categories is always an array
        if (categories && !Array.isArray(categories)) {
            categories = [categories];
        }

        // Count products (for pagination)
        const totalProducts = await productModel.countDocuments({ status: "Active" });
        const totalPages = Math.ceil(totalProducts / no_doc_on_each_pages);

        // Sorting order
        let sortOrder = 1; // default low to high
        if (sort === "highToLow") sortOrder = -1;

        if (categories && categories.length > 0) {
            products = await productModel.aggregate([
                { $match: { category: { $in: categories.map(id => new ObjectId(id)) } } },
                { $sort: { salesPrice: sortOrder } },
                { $skip: skip },
                { $limit: no_doc_on_each_pages }
            ]);
        } else {
            products = await productModel.find({ status: "Active" })
                .sort({ salesPrice: sortOrder })
                .skip(skip)
                .limit(no_doc_on_each_pages)
                .exec();
        }

        const category = await categoryModel.find({});

        res.render("user/home", {
            userEmail,
            loggedIn,
            products,
            category,
            totalPages,
            page,
            selectedSort: sort,
            selectedCategories: categories || []
        });
    } catch (error) {
        console.log(error);
    }
};


const searchProduct = async (req, res) => {
    try {
        const { search } = req.body;
        const userEmail = req.cookies.userEmail;
        const loggedIn = req.cookies.loggedIn;
        const page = req.query.page || 1;
        const no_doc_on_each_pages = 9;
        const regex = new RegExp(search, "i")
        const totalProducts = await productModel.countDocuments({
            status: "Active", productName: regex,
        });
        const category = await categoryModel.find({});
        const totalPages = Math.ceil(totalProducts / no_doc_on_each_pages)
        const skip = (page - 1) * no_doc_on_each_pages
        const products = await productModel.find({ productName: regex, status: "Active" }).skip(skip).limit(no_doc_on_each_pages)
        res.render("user/home", { userEmail, loggedIn, products, category, page, totalPages, selectedSort: null, selectedCategories: [] });
    } catch (error) {
        console.log(error);
    }
};


const aboutPage = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        res.render("user/about", { loggedIn })
    } catch (error) {
        console.log(error);
    }
}

const loadSalesPage = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        const products = await productModel.find({ discountStatus: "Active" })
        res.render("user/salesPage", { loggedIn, products })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    filterAndSort,
    searchProduct,
    aboutPage,
    loadSalesPage
}

// const filterAndSort = async (req, res) => {
//     try {
//         const ObjectId = mongoose.Types.ObjectId;
//         let { sort, categories } = req.body;
//         console.log(sort);
//         console.log(categories);
//         const loggedIn = req.cookies.loggedIn;
//         const userEmail = req.cookies.userEmail;

//         if (sort) {
//             sort = sort == "highToLow" ? -1 : 1;
//         }

//         console.log(sort);

//         async function categoryResult(sort, filter) {
//             const objectIdArray = (categories && categories.length > 0)
//                 ? categories.map(category => new ObjectId(category))
//                 : undefined;

//             let pipeline = [];

//             // Conditionally add $match stage based on the presence of categories
//             if (objectIdArray) {
//                 pipeline.push({ $match: { category: { $in: objectIdArray } } });
//             }

//             pipeline.push(
//                 {
//                     $lookup: {
//                         from: 'categories',
//                         localField: 'category',
//                         foreignField: '_id',
//                         as: 'categoryData'
//                     }
//                 },
//                 {
//                     $unwind: '$categoryData'
//                 }
//             );

//             // Check if sort parameter is provided
//             if (sort !== undefined && sort !== null) {
//                 // If sort is provided, add the $sort stage to the pipeline
//                 pipeline.push({ $sort: { salesPrice: sort } });
//             }

//             const sortedFilter = await productModel.aggregate(pipeline);
//             return sortedFilter;
//         }

//         const products = await categoryResult(sort, categories);
//         console.log(products);

//         const category = await categoryModel.find({});
//         res.render("user/home", { userEmail, loggedIn, products, category });

//     } catch (error) {
//         console.log(error);
//     }
// };
