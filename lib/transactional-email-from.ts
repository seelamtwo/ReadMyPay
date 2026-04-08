/**
 * From address for all transactional Resend mail (signup verification, password reset).
 * Must be allowed in Resend for readmypay.com (exact mailbox you verified).
 * Plain address avoids display-name parsing issues with some Resend/domain setups.
 */
export const TRANSACTIONAL_EMAIL_FROM = "support@readmypay.com";
