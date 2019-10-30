const express = require('express');
const router = express.Router();
//middleware
const auth = require('../../middleware/auth');

//models
const User = require('../../models/User');

//@route GET api/auth
//@desc Get authorized user's info
//@access Public
router.get('/', auth, async (req, res) => {
    try {
        //Search in the db for the user with same id, output the user from db, leaving out the password
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error.');
    }
});

module.exports = router;