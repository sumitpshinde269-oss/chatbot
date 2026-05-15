const z = require('zod');

const createPostSchema = z.object({
  text: z.string().min(1),
  type: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

module.exports = { createPostSchema };