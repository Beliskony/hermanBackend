// src/utils/id.ts
import crypto from 'crypto';
export const newId = () => crypto.randomBytes(8).toString('hex');