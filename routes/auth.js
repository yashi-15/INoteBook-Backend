const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "Hellobrohowareyou";


// ROUTE 1: CREATE NEW USER 
router.post("/createUser", [body("name", "Enter a valid name").isLength({ min: 3 }), body("email", "Enter a valid Email").isEmail(), body("password").isLength({ min: 5 })], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //check whether email exists already.
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Email is  already registered." });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        const data = {
            user: user.id,
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error ");
    }
});


// ROUTE 2: AUTHENTICATE  THE USERS AND GET BACK A TOKEN 
// Authenticate a user
router.post("/login", [body("email", "Enter a valid Email").isEmail(), body("password", "Password cannot be blank").exists()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }
        const data = {
            user: user.id,
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ authtoken });
    } catch (error) {
        res.status(500).send("Internal server error ");
    }
});

module.exports = router;
