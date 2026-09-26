import { z } from 'zod';

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

export const otpSchema = z.string().length(6, 'Enter the 6-digit code');

/** The only "correct" code in this POC — no SMS is ever sent, see Phase 5 notes. */
export const MOCK_OTP_CODE = '123456';
