const postRepo = require('../repositories/postRepository');
const { getIo } = require('../config/socket');

async function createPost(userId, { text, type, lat, lng, imageUrl }) {
  const location = lat && lng ? { lat, lng } : null;
  const post = await postRepo.create({
    text,
    userId,
    type,
    location,
    imageUrl,
    source: 'citizen',
  });
  const io = getIo();
  io.emit('newPost', post);
  // Trigger alert checking later (bull job)
  return post;
}

async function getLatestPosts(limit = 50) {
  return postRepo.findMany(limit);
}

module.exports = { createPost, getLatestPosts };