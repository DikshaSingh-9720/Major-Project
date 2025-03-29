const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema.js");
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js")
const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createNewListing));


router.get("/category/:category", async (req, res) => {
    const category = req.params.category;
    const listings = await Listing.find({ category: category });
    res.render("./listings/category", { listings, category });
});

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Search route
router.get("/search",wrapAsync( async (req, res) => {
    const query = req.query.query; // Get the query from the search form
    
    if (!query) {
        return res.redirect("/listings"); // If no query, redirect to the homepage
    }

    try {
        // Search for listings that match the query (case-insensitive search)
        const results = await Listing.find({
        title: { $regex: query, $options: "i" } // Regex search, case insensitive
    });
    
    console.log(results);
    // Render search.ejs with the results and the search query
    res.render("./listings/search.ejs", {
        results: results, 
        query: query
    });
} catch (err) {
    res.status(500).render("error.ejs", { message: "Something went wrong, please try again later." });
}
}));

router.route("/:id")
    .get(wrapAsync(listingController.showRoute))
    .put(
        isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing))
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing));


//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.editListing));


    

module.exports = router;