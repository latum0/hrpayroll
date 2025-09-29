// lib/crypto.ts
import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12; // 96-bit IV, recommended
const KEY_HEX = process.env.DATA_ENC_KEY_HEX;
const HMAC_KEY_HEX = process.env.HMAC_KEY_HEX;

if (!KEY_HEX) throw new Error('DATA_ENC_KEY_HEX env var missing');
if (!HMAC_KEY_HEX) throw new Error('HMAC_KEY_HEX env var missing');

const KEY = Buffer.from(KEY_HEX, 'hex');
const HMAC_KEY = Buffer.from(HMAC_KEY_HEX, 'hex');

if (KEY.length !== 32) throw new Error('DATA_ENC_KEY_HEX must be 32 bytes (64 hex chars)');
if (HMAC_KEY.length < 16) console.warn('HMAC_KEY_HEX should be at least 16 bytes');

export function normalizeIban(iban: string) {
    return iban.replace(/\s+/g, '').toUpperCase();
}

export function computeHmacHex(value: string) {
    return crypto.createHmac('sha256', HMAC_KEY).update(value).digest('hex');
}

export function encryptPlaintext(plaintext: string) {
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: 16 });
    const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        ciphertext: ciphertext.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
    };
}

export function decryptCipher(ciphertextBase64: string, ivBase64: string, tagBase64: string) {
    const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(ivBase64, 'base64'), { authTagLength: 16 });
    decipher.setAuthTag(Buffer.from(tagBase64, 'base64'));
    const pt = Buffer.concat([decipher.update(Buffer.from(ciphertextBase64, 'base64')), decipher.final()]);
    return pt.toString('utf8');
}

export function maskIban(iban: string) {
    const s = normalizeIban(iban);
    return '**** **** **** ' + s.slice(-4);
}
