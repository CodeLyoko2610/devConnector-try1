const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//middleware
const auth = require('../../middleware/auth');

//models
const User = require('../../models/User');


//@route GET api/auth
//@desc Get authorized user's info
//@access Private
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

//@route POST api/users
//@desc Log in user
//@access Public
router.post('/', [
    check('email', 'Please enter a valid email.').isEmail(),
    check('password', 'Password is required.').exists(), //Only check if the user input the password
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const { email, password } = req.body;

        try {
            //See if user exists
            let userInDB = await User.findOne({ email: email });

            if (!userInDB) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials.' }] }); //show no specific errors to prevent security holes
            } else {
                //check if the password matches
                const isMatch = await bcrypt.compare(password, userInDB.password);

                if (!isMatch) {
                    return res.status(400).json({ errors: [{ msg: 'Invalid Credentials.' }] }); //same explanation above
                }

                let payload = {
                    user: {
                        id: userInDB.id,
                        name: userInDB.name,
                        email: userInDB.email,
                    }
                };

                jwt.sign(
                    payload,
                    config.get('jwtKey'),
                    { expiresIn: 360000 },
                    (error, token) => {
                        if (error) throw error;

                        res.json({ token });
                    }
                );
            }
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error.');
        }
    }
});

module.exports = router;