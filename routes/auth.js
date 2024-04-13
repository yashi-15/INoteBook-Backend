const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken')
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require( "bcryptjs" );
const JWT_SECRET = "Hellobrohowareyou"

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
        const salt =  await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        const data = {
            "user" : user.id
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error");
    }
});

module.exports = router;
