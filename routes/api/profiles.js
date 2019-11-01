const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator');
//models
const User = require('../../models/User');
const Profile = require('../../models/Profile');

//middleware
const auth = require('../../middleware/auth');

//@route GET api/profiles/me
//@desc Get current user profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user.'
            });
        }

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error.');
    }
});

//@route POST api/profiles
//@desc Create or Update a user's profile
//@access Private
router.post('/', [
    auth,
    check('status', 'Status must be provided.').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

});


module.exports = router;