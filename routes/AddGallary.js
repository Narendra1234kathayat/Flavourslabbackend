const express = require("express");
const router = express.Router();
const Gallery = require("../models/Gallery");
const jwt = require("jsonwebtoken");

const { body, validationResult } = require("express-validator");
const multer = require("multer");

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

router.get("/fetchgallary", async (req, res) => {
    try {
        const gallerys = await Gallery.find({});
        res.json(gallerys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post(
    "/addgallery",
    upload.single("image"),
    [
        body("name").isLength({ min: 5 }),
        // No need to validate image length as it's being handled by multer
    ],
    async (req, res) => {
        console.log(req.file);

        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const result = validationResult(req);
            const { name } = req.body;

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const gallery = new Gallery({
                name,
                image: req.file.filename,
            });

            const savedGallery = await gallery.save();
            res.json(savedGallery);
        } catch (error) {
            console.log(error, "is the error");
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);
router.post("/updategallery/:id", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        let updateFields = { name };

        // Check if a new image is uploaded
        if (req.file) {
            updateFields.image = req.file.filename;
        }
        console.log(req.file);

        // Find the gallery item by ID and update its fields
        const updatedGallery = await Gallery.findByIdAndUpdate(id, updateFields, {
            new: true,
        });

        if (!updatedGallery) {
            return res.status(404).json({ message: "Gallery item not found" });
        }

        res.json(updatedGallery);
    } catch (error) {
        console.error("Error updating gallery image:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params; // Assuming id is sent in the request body
        if (!id) {
            return res.status(400).json({ error: "ID is required" });
        }
        const deletedGallery = await Gallery.findByIdAndDelete(id);
        if (!deletedGallery) {
            return res.status(404).json({ error: "Gallery not found" });
        }
        res.status(200).json({ message: "Gallery deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;