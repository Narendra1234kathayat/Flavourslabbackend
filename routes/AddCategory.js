const express = require("express");
const router = express.Router();
const category = require("../models/Category");
const verifyUser = require("../middlewares/VerifyUser");

const { body, validationResult } = require("express-validator");
const multer = require("multer");
const Product = require("../models/Product");

// JWT contains - Header, payload(Data), & Signature
const JWT_SECRET = "welcometoflavourfusion";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Multer");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.get("/fetchcategory", async (req, res) => {
  try {
    // console.log(req.user);

    const catergories = await category.find({});
    res.json(catergories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post(
  "/addcategory",
  upload.single("image"),
  [
    body("name").isLength({ min: 2 }),

    // No need to validate image length as it's being handled by multer
  ],
  async (req, res) => {
    // console.log(req.file);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = validationResult(req);
      const { name, type } = req.body;

      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const cat = new category({
        name,
        type,
        image: req.file.filename,
      });

      const savecategory = await cat.save();
      res.json(savecategory);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
router.post(
  "/updatecategory/:id",
  upload.single("image"),
  [
    body("name").isLength({ min: 3 }),

    // No need to validate image length as it's being handled by multer
  ],
  async (req, res) => {
    // console.log(req.file);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = validationResult(req);
      const { name, type } = req.body;

      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const cat = new category({
        name,
        type,
        image: req.file.filename,
      });

      const savecategory = await cat.save();
      res.json(savecategory);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
router.post("/delete", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "No category found" });
    }

    // Delete the category
    const deletedCategory = await category.findOneAndDelete({ name });

    if (!deletedCategory) {
      return res
        .status(400)
        .json({ message: "Category not found or already deleted" });
    }

    // Delete products associated with this category
    const deletedProducts = await Product.deleteMany({ productcategory: name });

    if (!deletedProducts) {
      return res.status(500).json({ message: "Not Deleted" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
