const RULES = [
  { test: (p: string) => p.length >= 8, message: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), message: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), message: "One lowercase letter" },
  { test: (p: string) => /\d/.test(p), message: "One digit" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), message: "One special character" },
] as const

export interface PasswordStrength {
  score: number
  max: number
  failed: string[]
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const failed: string[] = []
  for (const rule of RULES) {
    if (!rule.test(password)) {
      failed.push(rule.message)
    }
  }
  return { score: RULES.length - failed.length, max: RULES.length, failed }
}

export function getPasswordError(password: string): string | null {
  const { failed } = checkPasswordStrength(password)
  if (failed.length === 0) return null
  return "Password must have: " + failed.join(", ")
}
