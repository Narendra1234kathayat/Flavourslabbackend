const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

router.get("/topproduct", async (req, res) => {
    try {
      const topProducts = await Order.aggregate([
        { $unwind: "$orderproducts" }, // Unwind the orderproducts array
        {
          $group: {
            _id: "$orderproducts.productname", // Group by product name
            totalQuantity: { $sum: "$orderproducts.quantity" }, // Calculate total quantity for each product
          },
        },
        { $sort: { totalQuantity: -1 } }, // Sort by total quantity in descending order
        { $limit: 5 }, // Limit to top 5 products
      ]);
  
      return res.json(topProducts);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });


router.post("/fetchproducts/:type", async (req, res) => {
    const { type } = req.params; // Extracting type from request params
    console.log(type);

    try {
        let products;

        if (type == "recommended") {
            const topProducts = await Order.aggregate([
                { $unwind: "$orderproducts" }, // Unwind the orderproducts array
                {
                    $group: {
                        _id: "$orderproducts.productname", // Group by product name
                        totalQuantity: { $sum: "$orderproducts.quantity" }, // Calculate total quantity for each product
                    },
                },
                { $sort: { totalQuantity: -1 } }, // Sort by total quantity in descending order
                { $limit: 5 }, // Limit to top 5 products
            ]);
            
            
            // Extract product names from the aggregation result
            const productNames = topProducts.map((product) => product._id);
            // console.log(productNames);
            // Find products based on the extracted product names
            products = await Product.find({ productname: { $in: productNames } });
          
        } else {
            products = await Product.find({ productcategory: type }); // Fetch products based on category
        }

        res.json(products); // Send the products as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" }); // Send 500 status and error message
    }
});
router.get('/fetchproduct',async(req,res)=>{
    try {
        const products=await Product.find({})
        if(!products){
            return res.status(401).json({error:"no product found"})
        }
        // console.log(products)
        return res.status(200).json(products)
        
    } catch (error) {
        return res.status(500).json({error:error});
        
    }
})


router.post('/addproduct', async (req, res) => {
    try {
        const { productName, productPrice, productDesc, category, type } = req.body;
        const newProduct = new Product({
            productname: productName,
            productprice: productPrice,
            productdesc: productDesc,
            productcategory: category,
            type: type
        });

        await newProduct.save();
        res.json({ success: true, message: 'Product added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to add product' });
    }
});
router.post('/deleteproduct/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ error: "product not found" });
        }
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
router.post('/updateproduct/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { productname, productprice, productdesc, type } = req.body;
        console.log(req.body)
        if (!id) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const product = await Product.findByIdAndUpdate(id, { 
            productname: productname,
            productprice: productprice,
            productdesc: productdesc,
            type: type
        }, { new: true });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});



module.exports = router;