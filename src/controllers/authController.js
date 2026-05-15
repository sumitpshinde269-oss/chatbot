const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validators/authValidator');

async function register(req, res) {
  const validated = registerSchema.parse(req.body);
  const result = await authService.register(validated);
  res.status(201).json(result);
}

async function login(req, res) {
  const validated = loginSchema.parse(req.body);
  const result = await authService.login(validated);
  res.json(result);
}

async function logout(req, res) {
  // client discards tokens – no server action needed
  res.json({ message: 'Logged out' });
}

module.exports = { register, login, logout };