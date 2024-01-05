const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel")
const mongoose = require('mongoose');

const filterAndSort = async (req, res) => {
    try {
        let products;
        const ObjectId = mongoose.Types.ObjectId;
        let { sort, categories } = req.body
        const loggedIn = req.cookies.loggedIn
        const userEmail = req.cookies.userEmail
        const page = req.query.page || 1;
        const no_doc_on_each_pages = 3;
        const totalProducts = await productModel.countDocuments({
            status: "Active",
        });
        const totalPages = Math.ceil(totalProducts / no_doc_on_each_pages)
        const skip = (page - 1) * no_doc_on_each_pages

        sort = (sort == "highToLow") ? -1 : 1;
        if (sort && categories) {
            products = await categoryResult(sort, categories)
        } else {
            products = await productModel.find({ status: "Active" })
                .sort({ salesPrice: sort })
                .skip(skip)
                .limit(no_doc_on_each_pages)
                .exec();
        }

        async function categoryResult(sort, filter) {
            const objectId = new ObjectId(filter)
            const sortedFilter = await productModel.aggregate([{ $match: { category: objectId } },
            {
                $lookup: {
                    from: 'categories', // Adjust this based on your actual collection name
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            {
                $unwind: '$categoryData' // Unwind the array created by $lookup (optional, depending on your use case)
            }, { $sort: { salesPrice: sort ? sort : 1 } }]).skip(skip)
                .limit(no_doc_on_each_pages)
            return sortedFilter
        }

        // console.log(products);
        const category = await categoryModel.find({})
        res.render("user/home", { userEmail, loggedIn, products, category, totalPages, page });
    } catch (error) {
        console.log(error);
    }
}

const searchProduct = async (req, res) => {
    try {
        const search = req.query.search;
        const userEmail = req.cookies.userEmail;
        const loggedIn = req.cookies.loggedIn;
        const page = req.query.page || 1;
        const no_doc_on_each_pages = 3;
        const totalProducts = await productModel.countDocuments({
            status: "Active",
        });
        const totalPages = Math.ceil(totalProducts / no_doc_on_each_pages)
        const skip = (page - 1) * no_doc_on_each_pages
        let category = await categoryModel.find({});
        let products = await productModel.find({ status: "Active" })
        let regexPattern;

        if (search) {
            regexPattern = new RegExp(search, "i");

            products = await productModel.find(

                { productName: { $regex: regexPattern } }


            ).skip(skip).limit(no_doc_on_each_pages)
        }
        res.render("user/home", { userEmail, loggedIn, products, category, page, totalPages });
    } catch (error) {
        console.log(error);
    }
};




module.exports = {
    filterAndSort,
    searchProduct
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
