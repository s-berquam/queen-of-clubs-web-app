export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string) {
  return /^\+?[\d\s\-]{7,15}$/.test(phone)
}
