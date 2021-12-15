export function getAmountWithDecimal(amount: number, decimal: number) {
  while (decimal > 0) {
    amount /= 10;
    decimal--;
  }

  return amount;
}