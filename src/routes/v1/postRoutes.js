const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const postController = require('../../controllers/postController');
const upload = require('../../middleware/upload');
const validate = require('../../middleware/validate');
const { createPostSchema } = require('../../validators/postValidator');

router.get('/', postController.getPosts);
router.post('/', auth, upload.single('image'), validate(createPostSchema), postController.createPost);
router.post('/upload', auth, upload.single('image'), postController.uploadImage);

module.exports = router;