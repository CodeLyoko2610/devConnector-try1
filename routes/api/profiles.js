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
router.post(
  '/',
  [
    auth,
    check('status', 'Status must be provided.')
      .not()
      .isEmpty(),
    check('skills', 'Skills is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
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
      profileFields.skills = skills.split(',').map(skill => skill.trim());
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
      let profile = await Profile.findOne({
        user: req.user.id
      });

      //If profile exists, update
      if (profile) {
        profile = await Profile.findOneAndUpdate({
          user: req.user.id
        },
          //profileFields
          {
            $set: profileFields
          }, {
          new: true
        }
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
  }
);

//@route GET api/profiles
//@desc Get all users'profiles
//@access Public
router.get('/', async (req, res) => {
  try {
    let profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

//@route GET api/profiles/user/:user_id
//@desc Get 1 user's profile by user id
//@access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    let profile = await Profile.findOne({
      user: req.params.user_id
    }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) return res.status(400).json({
      msg: 'Profile not found.'
    });

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == 'ObjectId') {
      return res.status(400).json({
        msg: 'Profile not found.'
      }); //so in case of invalid user_id, the response is also the same
    }
    res.status(500).send('Server error.');
  }
});

//@route DELETE api/profiles/
//@desc Delete a user, his profile, and his posts
//@access Private
router.delete('/', auth, async (req, res) => {
  try {
    //@---Todo: Remove user's post
    //Remove user
    await User.findOneAndDelete({
      _id: req.user.id
    });
    //Remove profile
    await Profile.findOneAndDelete({
      user: req.user.id
    });

    res.json({
      msg: 'User deleted.'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

//@route PUT api/profiles/experience
//@desc Add experience to an authorized user's profile
//@access Private
router.put('/experience', [auth, [
  check('title', 'Please enter a title.').not().isEmpty(),
  check('company', 'Please enter a company.').not().isEmpty(),
  check('from', 'Please enter the date you start working at the company.').not().isEmpty(),
]], async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let {
    title,
    company,
    location,
    from,
    to,
    description,
    current
  } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    description,
    current
  }

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    profile.experience.unshift(newExp); //Put the new experience on top of the others

    profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
})

//@route DELETE api/profiles/experience/:exp_id
//@desc Delete an experience from 1 user's profile
//@access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1); //remove x items from the specified index

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

//@route PUT api/profiles/education/:edu_id
//@desc Add education to user's profile
//@access Private
router.put('/education', [auth, [
  check('school', 'Name of school is required.').not().isEmpty(),
  check('degree', 'Name of degree is required.').not().isEmpty(),
  check('fieldofstudy', 'Field of study is required.').not().isEmpty(),
  check('from', 'Please enter a start date.').not().isEmpty(),
]], async (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    let {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    let newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    await profile.education.unshift(newEdu);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

//@route DELETE api/profiles/education/:edu_id
//@desc Delete an education from 1 user's profile
//@access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1); //remove x items from the specified index

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error.');
  }
});

module.exports = router;