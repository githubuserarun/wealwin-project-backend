const express = require('express');
const router = express.Router();
const multer = require('multer');
const Products = require('../models/productsModel');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});


const upload = multer({ storage: storage });

router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const newProduct = new Products({
            productName: req.body.productName,
            category: req.body.category,
            subcategory: req.body.subcategory,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            image: req.file.path
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('catch err:', err);
        res.status(200).json({ error: 'Server error', status: false });
    }
});

router.get('/view', async (req, res) => {
    try {
        const products = await Products.find();
        res.json({ data: products, status: true  });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error', status: false });
    }
})

router.get('/filter', async (req, res) => {
    try {
        let query = {};

        // Check if there is a search query parameter
        if (req.query.search) {
            // Case-insensitive search using regular expression
            query = {
                $or: [
                    { productName: { $regex: new RegExp(`\\b${req.query.search}\\b`, 'i') } }, // Match whole word
                    { subcategory: { $regex: new RegExp(`\\b${req.query.search}\\b`, 'i') } },
                    { category: { $regex: new RegExp(`\\b${req.query.search}\\b`, 'i') } },
                ]
            };
        }

        const filteredProducts = await Products.find(query);
        res.json({ data: filteredProducts, status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});

router.get('/searchfilter', async (req, res) => {
    try {
        let query = {};

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i'); // 'i' for case-insensitive

            query = {
                $or: [
                    { productName: { $regex: searchRegex } },
                    { subcategory: { $regex: searchRegex } },
                    { category: { $regex: searchRegex } },
                ]
            };
        }
console.log(query)
        const filteredProducts = await Products.find(query);
        res.json({ data: filteredProducts, status: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error', status: false });
    }
});


// router.post('/add-cat', async (req, res) => {
//     const { category } = req.body;

//     if (!category) {
//         return res.status(400).json({ error: 'Category is required', status: false });
//     }

//     try {
//         const newCategory = new categoryCollection({ category });
//         await newCategory.save();
//         res.json({ data: newCategory, status: true });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error', status: false });
//     }
// });

// router.get('/view-cat', async (req, res) => {
//     try {
//         const categories = await categoryCollection.find();
//         res.json({ data: categories, status: true });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error', status: false });
//     }
// });


// router.delete('/del-cat/:id', async (req, res) => {
//     const { id } = req.params;

//     try {
//         const result = await categoryCollection.findByIdAndDelete(id);

//         if (result) {
//             res.json({ status: true, message: 'Category deleted successfully.' });
//         } else {
//             res.status(404).json({ status: false, message: 'Category not found.' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: false, message: 'Server error.' });
//     }
// });



// router.put('/update-cat', async (req, res) => {
//     const { id,category } = req.body;
//     console.log(req.body)

//     if (!category) {
//         return res.status(400).json({ status: false, message: 'Category name is required' });
//     }

//     try {
//         const updatedCategory = await categoryCollection.findByIdAndUpdate(
//             id,
//             { category },
//             { new: true, runValidators: true }
//         );

//         if (updatedCategory) {
//             res.json({ status: true, message: 'Category name updated successfully', data: updatedCategory });
//         } else {
//             res.status(404).json({ status: false, message: 'Category not found' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: false, message: 'Server error' });
//     }
// });


router.put('/update/:id', upload.single('image'), async (req, res) => {
    try {
        console.log('enter try');
        const productId = req.params.id;
        const update = {
            productName: req.body.productName,
            category: req.body.category,
            subcategory: req.body.subcategory,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
        };

        // Check if there's a new image uploaded
        if (req.file) {
            update.image = req.file.path;
        }

        // Find the product by ID and update
        const updatedProduct = await Products.findByIdAndUpdate(productId, update, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found',status:false });
        }

        res.status(200).json({message:"product successfully updated.", status:true});
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Server error', status: false });
    }
});


module.exports = router;

