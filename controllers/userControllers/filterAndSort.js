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
        sort = (sort == "highToLow") ? -1 : 1;
        if (sort && categories) {
            products = await categoryResult(sort, categories)
        } else {
            products = await productModel.find({})
                .sort({ salesPrice: sort })
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
            }, { $sort: { salesPrice: sort ? sort : 1 } }])
            return sortedFilter
        }
        // console.log(products);
        const category = await categoryModel.find({})
        res.render("user/home", { userEmail, loggedIn, products, category });
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    filterAndSort
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
