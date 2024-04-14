const express = require("express");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
var fetchuser = require("../middleware/fetchuser");
const router = express.Router();

// ROUTE 1: Get all the notes using: GET "/api/notes/fetchallnotes" .Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user});
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error ");
    }
});

// ROUTE 2: Add a new note using: POST "/api/notes/addnote" .Login required
router.post("/addnote", fetchuser, [body("title", "Enter a valid title").isLength({ min: 3 }), body("description").isLength({ min: 5 })], async (req, res) => {
    try {
        console.log("hello")
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title,
            description,
            tag,
            user: req.user,
        });
        const savedNote = await note.save();

        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error ");
    }
});

// ROUTE 3: Update an existing note using: POST "/api/notes/updatenote/id" .Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    console.log("hiiiiiiiiiiiiii")
    const { title, description, tag } = req.body;
    // create a newnote object    
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};


    // Find the note to be updated and update it 
    console.log(req.params.id)
    let note = await Notes.findById(req.params.id);
    console.log(note.user)
    if(!note){res.status(404).send("Not Found")}
    if(note.user.toString()!== req.user){
        return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true })
    res.json({note});


});


module.exports = router;
