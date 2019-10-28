const express = require('express');
const router = express.Router();
//middleware
const auth = require('../../middleware/auth');

//models
const User = require('../../models/User');

//@route GET api/auth
//@desc Test route
//@access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error.');
    }
});

module.exports = router;