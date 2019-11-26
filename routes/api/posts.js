const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

//middleware
const auth = require('../../middleware/auth');

//models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route POST api/posts
//@desc Create a post
//@access Private
router.post('/', [
    auth,
    [
        check('text', 'Please input something.').not().isEmpty(),
    ]
], async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let user = await User.findById(req.user.id).select('-password');

        let newPost = new Post({
            user: user.id,
            name: user.name,
            avatar: user.avatar,
            text: req.body.text
        });

        await newPost.save();

        res.json(newPost);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error.');
    }
});

//@route GET api/posts
//@desc Get all posts of all users
//@access Private
router.get('/', auth, async (req, res) => {
    try {
        let posts = await Post.find().sort({ date: -1 });

        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error.');
    }
})

//@route GET api/posts/:post_id
//@desc Get 1 post by id
//@access Private
router.get('/:post_id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.post_id);

        if (!post) {
            return res.status(404).json({ msg: 'Post is not found.' });
        }

        res.json(post);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post is not found.' });
        }
        res.status(500).send('Server error.');
    }
});

//@route DELETE api/posts/:post_id
//@desc Delete a post by a user
//@access Private
router.delete('/:post_id', auth, async (req, res) => {
    try {
        let postToRemove = await Post.findById(req.params.post_id);

        //Check if post exists
        if (!postToRemove) {
            return res.status(404).json({ msg: 'Post is not found.' });
        }

        //Check if user is owner of the post
        if (postToRemove.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User is not authorized.' });
        }

        await postToRemove.remove();

        res.json({ msg: 'Post is removed.' });
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post is not found.' });
        }
        res.status(500).send('Server error.');
    }
});


module.exports = router;