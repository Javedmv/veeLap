const categoryModel = require("../../models/categoryModel")

const loadCategory = async (req, res) => {
    try {
        const categories = await categoryModel.find()
        res.render("admin/admincategory", { categories })
    } catch (error) {
        console.log(error)
    }
}

const addCategory = async (req, res) => {
    try {
        const { status, categoryName } = req.body
        const categoryData = await categoryModel.findOne({ categoryName: categoryName })
        if (categoryData) {
            res.status(409).json({ message: "Category Already Exists" })
        } else {
            await categoryModel.create({
                categoryName: categoryName,
                status: status
            })
            const categories = await categoryModel.find();
            res.status(200).json({ message: "Category Added Successfully" })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

const loadEditCategory = async (req, res) => {
    try {
        const categoryID = req.params.id
        const categortData = await categoryModel.findById({ _id: categoryID });
        res.render("admin/editcategory", { categortData })
    } catch (error) {
        console.log(error);
    }
}

const editCategory = async (req, res) => {
    try {

        const { newCatgName } = req.body
        const categoryID = req.params.id
        const category = await categoryModel.findById({ _id: categoryID });
        category.categoryName = newCatgName
        await category.save();
        res.redirect("/admin/view-allcategory")
    } catch (error) {
        console.log(error);
    }
}

const statusCategory = async (req, res) => {
    try {
        const { id } = req.query
        let userData = await categoryModel.findById({ _id: id })
        console.log(userData);
        if (userData.status === "Active") {
            userData.status = "Inactive"
            await userData.save()
        } else {
            userData.status = "Active"
            await userData.save()
        }
        res.redirect("/admin/view-allcategory")
    } catch (error) {
        console.log(error);
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        const userData = await categoryModel.findById({ _id: id });
        if (userData) {
            await categoryModel.deleteOne({ _id: userData.id })
        }
        res.redirect("/admin/view-allcategory")
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadCategory,
    addCategory,
    loadEditCategory,
    editCategory,
    statusCategory,
    deleteCategory
}