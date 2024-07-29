const express = require('express');
const router = express.Router();
const categoryCollection = require('../models/categoryModel');
const subcategoryCollection = require('../models/subcategoryModel');


router.post('/add-cat', async (req, res) => {
    const { category } = req.body;
    const existCategory = await categoryCollection.findOne({category})

    if (existCategory) {
        return res.status(200).json({ error: 'Category already exist!', status: false });
    }

    if (!category) {
        return res.status(200).json({ error: 'Category is required', status: false });
    }

    try {
        const newCategory = new categoryCollection({ category });
        await newCategory.save();
        res.json({ data: newCategory, status: true , message: 'category successfully added.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});

router.get('/view-cat', async (req, res) => {
    try {
        const categories = await categoryCollection.find();
        res.json({ data: categories, status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});


router.delete('/del-cat/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await categoryCollection.findByIdAndDelete(id);

        if (result) {
            res.json({ status: true, message: 'Category deleted successfully.' });
        } else {
            res.status(404).json({ status: false, message: 'Category not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error.' });
    }
});



router.put('/update-cat', async (req, res) => {
    const { id,category } = req.body;
    console.log(req.body)

    if (!category) {
        return res.status(400).json({ status: false, message: 'Category name is required' });
    }

    try {
        const updatedCategory = await categoryCollection.findByIdAndUpdate(
            id,
            { category },
            { new: true, runValidators: true }
        );

        if (updatedCategory) {
            res.json({ status: true, message: 'Category name updated successfully', data: updatedCategory });
        } else {
            res.status(404).json({ status: false, message: 'Category not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
});

router.post('/add-subcat', async (req, res) => {
    const { categoryId, subCategory } = req.body;

    if (categoryId === undefined || subCategory === undefined) {
        return res.status(200).json({ error: 'Please select category and enter subcategory', status: false });
    }

    try {
        const findCategory = await categoryCollection.findOne({ _id: categoryId });

        if (findCategory) {
            const newSubCategory = new subcategoryCollection({ categoryId: categoryId, subcategory: subCategory });
            await newSubCategory.save();

            res.status(200).json({ message: 'Subcategory successfully added.',status:true });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});

router.get('/view-subcat', async (req, res) => {
    try {
        const subCategories = await subcategoryCollection.find().populate('categoryId', 'category');
        res.json({ data: subCategories, status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});

// router.put('/edit-subcat/:id', async (req, res) => {
//     const { id } = req.params;
//     const { categoryId, subcategory } = req.body;

//     if (!categoryId || !subcategory) {
//         return res.status(400).json({ error: 'Please provide both category ID and subcategory name', status: false });
//     }

//     try {
//         const updatedSubCategory = await subcategoryCollection.findByIdAndUpdate(
//             id,
//             { categoryId, subcategory },
//             { new: true }
//         ).populate('categoryId', 'category');

//         if (!updatedSubCategory) {
//             return res.status(404).json({ message: 'Subcategory not found', status: false });
//         }

//         res.json({ data: updatedSubCategory, status: true });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error', status: false });
//     }
// });

router.put('/update-subcat', async (req, res) => {
    const { categoryId, subcategoryId, subcategoryName } = req.body;

    if (!categoryId || !subcategoryId || !subcategoryName) {
        return res.status(400).json({ error: 'Please provide categoryId, subcategoryId, and subcategoryName', status: false });
    }

    try {
        // Check if the category exists
        const categoryExists = await categoryCollection.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Category not found', status: false });
        }

        // Check if the subcategory exists
        const subcategoryExists = await subcategoryCollection.findOne({ _id: subcategoryId });
        if (!subcategoryExists) {
            return res.status(404).json({ message: 'Subcategory not found', status: false });
        }

        // Update the subcategory name
        subcategoryExists.subcategory = subcategoryName;
        subcategoryExists.categoryId = categoryId;
        await subcategoryExists.save();

        res.json({ message: 'Subcategory name updated successfully', status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});



module.exports = router;

