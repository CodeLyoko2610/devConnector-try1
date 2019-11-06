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

    //Collect information from request's body
    const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        youtube,
        twitter,
        facebook,
        linkedin,
        instagram
    } = req.body;

    let profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;

    //Skill field
    if (skills) {
        profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    //Social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    //Building / Updating user profile from collected info
    try {
        let profile = await Profile.findOne({ user: req.user.id });

        //If profile exists, update
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                //profileFields
                { $set: profileFields },
                { new: true }
            );

            return res.json(profile);
        }

        //If not, create new one
        profile = new Profile(profileFields);
        await profile.save();

        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error.');
    }
});


module.exports = router;