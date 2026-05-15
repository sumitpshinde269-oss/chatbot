const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const settingsController = require('../../controllers/settingsController');
const validate = require('../../middleware/validate');
const { updateSettingsSchema } = require('../../validators/settingsValidator');

router.get('/', auth, settingsController.getSettings);
router.put('/', auth, validate(updateSettingsSchema), settingsController.updateSettings);

module.exports = router;