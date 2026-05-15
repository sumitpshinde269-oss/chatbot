const userRepo = require('../repositories/userRepository');
const settingsRepo = require('../repositories/settingsRepository');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

async function register({ email, password, name }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new Error('Email already registered');
  const passwordHash = await hashPassword(password);
  const user = await userRepo.createUser({ email, passwordHash, name });
  // Create default settings
  await settingsRepo.upsert(user.id, {});
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { user: { id: user.id, email, name: user.name, role: user.role }, accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { user: { id: user.id, email, name: user.name, role: user.role }, accessToken, refreshToken };
}

module.exports = { register, login };