const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Post = require('../models/Post');

// @route   POST /api/posts
// @desc    Create post
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const postData = { ...req.body, author: req.userId };
    const post = new Post(postData);
    await post.save();
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/posts
// @desc    Get posts feed
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, tags, page = 1, limit = 20 } = req.query;
    const query = { isActive: true, visibility: 'public' };
    
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    
    const posts = await Post.find(query)
      .populate('author', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike post
// @access  Private
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.userId.toString()
    );
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: req.userId });
    }
    
    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
