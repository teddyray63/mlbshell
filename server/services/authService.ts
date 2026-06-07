/**
 * authService — password hashing (bcrypt) and JWT issuing/validation.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { PublicUser, User } from '../../shared/types';
import { createUser, getUserByEmail, getUserById } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

export interface JwtPayload {
  sub: string;
  email: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

export function generateToken(user: Pick<User, 'id' | 'email'>): string {
  const payload: JwtPayload = { sub: user.id, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function toPublicUser(user: User): PublicUser {
  // Strip passwordHash before returning to clients.
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export function registerUser(email: string, password: string): AuthResult {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) throw new Error('Email and password are required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');
  if (getUserByEmail(normalized)) throw new Error('An account with this email already exists');

  const user: User = {
    id: `user-${crypto.randomUUID()}`,
    email: normalized,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  createUser(user);
  return { user: toPublicUser(user), token: generateToken(user) };
}

export function loginUser(email: string, password: string): AuthResult {
  const normalized = email.trim().toLowerCase();
  const user = getUserByEmail(normalized);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid email or password');
  }
  return { user: toPublicUser(user), token: generateToken(user) };
}

export function getUserFromToken(token: string): PublicUser | null {
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = getUserById(payload.sub);
  return user ? toPublicUser(user) : null;
}
