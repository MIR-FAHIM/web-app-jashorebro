/**
 * Formats a numeric value into Bangladeshi Taka (BDT) representation.
 * Example: 1200 -> "৳1,200"
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '৳0'
  }
  return `৳${Number(amount).toLocaleString('en-BD')}`
}
