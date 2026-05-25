export function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  console.log('12345678',String(hash))
  return String(hash);
}

// Normalize phone: strip spaces, keep + and digits only for comparison
export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "");
}

// Validate phone: must start with +, then digits/spaces only, no hyphens
export function isValidPhone(phone: string): boolean {
  return /^\+[0-9]{1,3}( [0-9]+)+$/.test(phone) || /^\+[0-9]+$/.test(phone);
}
