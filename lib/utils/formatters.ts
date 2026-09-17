const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return inrFormatter.format(value);
}
