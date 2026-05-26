export function bool(value: boolean | undefined): string {
  return value === true ? 'true' : 'false'
}

export function escapeXml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export function escapeKotlinString(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
}

export function escapeGradleString(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function normalizeJvmTarget(raw?: string): string {
  const fallback = '21'
  if (!raw) return fallback
  const cleaned = String(raw).trim()
  const parsedNumber = Number(cleaned)
  if (!Number.isFinite(parsedNumber)) return fallback
  if (parsedNumber >= 24) return '21'
  if (parsedNumber >= 21) return '21'
  if (parsedNumber >= 17) return '17'
  if (parsedNumber >= 11) return '11'
  return '1.8'
}