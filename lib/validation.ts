import { z } from 'zod';

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

/**
 * Cleans phone input as it's typed. Phone keyboards and autofill can insert
 * spaces, dashes or "+91", and a raw maxLength={10} on the field then cuts the
 * number short (e.g. "98765 43210" -> "98765 4321", only 9 digits). Use this
 * in onChangeText instead of maxLength.
 */
export function normalizePhoneInput(text: string): string {
  let digits = text.replace(/\D/g, '');
  if (text.trim().startsWith('+') || (digits.length === 12 && digits.startsWith('91'))) {
    digits = digits.replace(/^91/, '');
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

export const otpSchema = z.string().length(6, 'Enter the 6-digit code');

/** The only "correct" code in this POC — no SMS is ever sent, see Phase 5 notes. */
export const MOCK_OTP_CODE = '123456';

// --- Checkout: shipping address ---
export const fullNameSchema = z.string().trim().min(2, 'Enter your full name');
export const addressLineSchema = z.string().trim().min(4, 'Enter a valid address');
export const citySchema = z.string().trim().min(2, 'Enter a valid city');
export const stateSchema = z.string().trim().min(2, 'Enter a valid state');
export const pincodeSchema = z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode');

// --- Checkout: mock card payment (see Phase 6 notes — no real payment gateway) ---
const cardDigits = (value: string) => value.replace(/\D/g, '');
export const cardNumberSchema = z
  .string()
  .transform(cardDigits)
  .refine((digits) => digits.length === 16, 'Enter a valid 16-digit card number');
export const cardExpirySchema = z
  .string()
  .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY format')
  .refine((value) => {
    const [month, year] = value.split('/').map(Number);
    const expiry = new Date(2000 + year, month, 0, 23, 59, 59);
    return expiry.getTime() >= Date.now();
  }, 'This card has expired');
export const cardCvvSchema = z.string().regex(/^\d{3,4}$/, 'Enter a valid CVV');
export const cardNameSchema = z.string().trim().min(2, 'Enter the name on the card');

// --- Enquiry form ---
export const optionalEmailSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || z.email().safeParse(value).success, 'Enter a valid email');
export const enquiryMessageSchema = z.string().max(1000, 'Keep your message under 1000 characters');

/** Always-valid mock card — autofilled by the "Use test card" shortcut, never charged for real. */
export const TEST_CARD = {
  number: '4242 4242 4242 4242',
  expiry: '12/29',
  cvv: '123',
  name: 'Test User',
};
