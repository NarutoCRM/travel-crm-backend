import jwt from "jsonwebtoken";
import crypto from "crypto";

import env from "../config/env.js";


// Generate JWT
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
};


// Sign JWT
const signToken = (payload) => {
  return generateToken(payload);
};


// Verify JWT
const verifyJwt = (token) => {
  return jwt.verify(
    token,
    env.jwtSecret
  );
};


// Verify Token
const verifyToken = (token) => {
  return verifyJwt(token);
};


// Hash Token
const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};


// Named exports
export {
  generateToken,
  signToken,
  verifyJwt,
  verifyToken,
  hashToken
};


// Default export
export default hashToken;