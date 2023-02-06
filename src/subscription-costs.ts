
// The target will be 1K sats per month
export const COST_PER_DAY = Math.floor(1e3 / 30)

// Discount threshold
const DISCOUNT_THRESHOLD = 30

const DiscountFactors = {
  proportional: 0.5,
  fixed: 500
}

export class SubscriptionCosts {
  static calculateCost(days: number) : number {
    let cost = days * COST_PER_DAY
    if (days > DISCOUNT_THRESHOLD) {
      cost = DISCOUNT_THRESHOLD * COST_PER_DAY +
        (days - DISCOUNT_THRESHOLD) * (COST_PER_DAY * DiscountFactors.proportional) 
    }
    return cost
  }
}