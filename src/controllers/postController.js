const postService = require('../services/postService');
const uploadService = require('../services/uploadService');
const { createPostSchema } = require('../validators/postValidator');

async function getPosts(req, res) {
  const limit = parseInt(req.query.limit) || 50;
  const posts = await postService.getLatestPosts(limit);
  res.json(posts);
}

async function createPost(req, res) {
  const validated = createPostSchema.parse(req.body);
  const imageUrl = req.file ? await uploadService.uploadImage(req.file.buffer, req.file.originalname) : undefined;
  const post = await postService.createPost(req.user.id, { ...validated, imageUrl });
  res.status(201).json(post);
}

async function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = await uploadService.uploadImage(req.file.buffer, req.file.originalname);
  res.json({ url });
}

module.exports = { getPosts, createPost, uploadImage };