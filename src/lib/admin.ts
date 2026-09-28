// ADMIN_EMAIL may list several addresses separated by commas; the first receives booking alerts.
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL || 'info@breathewrite.co.uk')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

export function primaryAdminEmail(): string {
  return adminEmails()[0]
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && adminEmails().includes(email.toLowerCase())
}
