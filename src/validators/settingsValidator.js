const z = require('zod');

const updateSettingsSchema = z.object({
  postThreshold: z.number().int().min(1).max(50).optional(),
  timeWindowMinutes: z.number().int().min(1).max(60).optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  webhookEnabled: z.boolean().optional(),
  webhookUrl: z.string().url().optional().nullable(),
  fakeNewsEnabled: z.boolean().optional(),
  fakeNewsSensitivity: z.number().int().min(0).max(100).optional(),
  fakeNewsAction: z.enum(['flag_only', 'reduce_confidence', 'exclude_from_alerts']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

module.exports = { updateSettingsSchema };