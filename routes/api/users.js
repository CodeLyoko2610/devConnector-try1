const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//Models
const User = require('../../models/User');

//@route POST api/users
//@desc Register user
//@access Public
router.post('/', [
    check('name', 'Name is required.').not().isEmpty(),
    check('email', 'Please enter a valid email.').isEmail(),
    check('password', 'Please enter a password with min length of 6 characters.').isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const { name, email, password } = req.body;

        try {
            //See if user exist
            let user = await User.findOne({ email: email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists.' }] });
            } else {
                //Get user avatar
                let avatar = gravatar.url(email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm',
                });

                //Create new user's instance - not save yet
                let newUser = new User({
                    name,
                    email,
                    avatar,
                    password
                });

                //Encrypt password
                let salt = await bcrypt.genSalt(10);
                newUser.password = await bcrypt.hash(password, salt);

                //Save user
                newUser.save();

                //Send jsonwebtoken  
                // let payload = {
                //     user: {
                //         id: newUser.id
                //     }
                // };

                // jwt.sign(
                //     payload,
                //     config.get('jwtToken'),
                //     { expiresIn: 360000 },
                //     (err, token) => {
                //         if (err) throw error;

                //         res.json({ token });
                //     }
                // )

                let payload = {
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
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
})

module.exports = router;