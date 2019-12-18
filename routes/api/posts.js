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

//@route PUT api/posts/like/:post_id
//@desc Like a post
//@access Private
router.put('/like/:post_id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.post_id);

        //Check if post has been liked
        if (post.likes.filter(like => (like.user.toString() === req.user.id)).length > 0) {
            return res.status(400).json({ msg: 'Post has already been liked.' });
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error.');
    }
});

//@route PUT api/posts/like/:post_id
//@desc Like a post
//@access Private
router.put('/like/:post_id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.post_id);

        //Check if post has been liked
        if (post.likes.filter(like => (like.user.toString() === req.user.id)).length > 0) {
            return res.status(400).json({ msg: 'Post has already been liked.' });
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error.');
    }
});

//@route PUT api/posts/unlike/:post_id
//@desc Unlike a post
//@access Private
router.put('/unlike/:post_id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.post_id);

        //Check if post has not been liked
        if (post.likes.filter(like => (like.user.toString() === req.user.id)).length === 0) {
            return res.status(400).json({ msg: 'Post has not been liked yet.' });
        }

        //Unlike process-quite long
        //let likeToRemove = post.likes.filter(like => (like.user.toString() === req.user.id));
        //let removeIndex = post.likes.indexOf(likeToRemove);

        let removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);
        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error.');
    }
})

//@route POST api/posts/comment/:post_id
//@desc Comment on a post
//@access Private
router.post('/comment/:post_id', [auth,
    [
        check('text', 'Please input something.').not().isEmpty(),
    ]
],
    async (req, res) => {
        try {
            let user = await User.findById(req.user.id).select('-password');
            let post = await Post.findById(req.params.post_id);

            //New comment object
            let newComment = {
                user: user.id,
                name: user.name,
                avatar: user.avatar,
                text: req.body.text
            }

            await post.comments.unshift(newComment);
            await post.save();

            res.json(post.comments);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error.');
        }
    }
)

//@route DELETE api/posts/comment/:post_id/:comment_id
//@desc Delete a comment on a post
//@access Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
    try {
        //Get the post
        let post = await Post.findById(req.params.post_id);

        //Pull out the required comment
        let comment = post.comments.find(comment => comment.id === req.params.comment_id);

        //Check if comment exists
        if (!comment) {
            return res.status(404).json({ msg: "Comment is not found." });
        }

        //Check if user is authorized to delete the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User is not authorized to delete the comment." });
        }

        //Delete proccess
        //let removeIndex = post.comments.indexOf(comment); -- another way to do it
        let removeIndex = post.comments.map(comment => comment.id.toString()).indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);
        await post.save();

        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error.');
    }
});

module.exports = router;    