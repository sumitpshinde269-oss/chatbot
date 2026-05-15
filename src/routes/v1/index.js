const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const settingsRoutes = require('./settingsRoutes');
const postRoutes = require('./postRoutes');
const statsRoutes = require('./statsRoutes');

router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/posts', postRoutes);
router.use('/stats', statsRoutes);

module.exports = router;