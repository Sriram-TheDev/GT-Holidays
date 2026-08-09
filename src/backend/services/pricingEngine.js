export function calculatePrice(params) {
  const {
    basePriceAdult,
    childPricePercent = 75,
    infantFee = 2000,
    adults = 0,
    children = 0,
    infants = 0,
    promoDiscountPct = 0,
    mealPlan = { breakfast: false, lunch: false, dinner: false },
    mealType = 'veg'
  } = params;

  const adultTotal = basePriceAdult * adults;
  const childTotal = (basePriceAdult * (childPricePercent / 100)) * children;
  const infantTotal = infantFee * infants;
  const totalPax = adults + children; // Infants exclude meal cost
  
  let mealTotal = 0;
  // Meal base pricing per person per day (assumes average package duration built in, or flat rate for simplicity)
  if (mealPlan.breakfast) mealTotal += totalPax * 500;
  if (mealPlan.lunch) mealTotal += totalPax * 800;
  if (mealPlan.dinner) mealTotal += totalPax * 900;
  
  // Non-veg premium if meals are selected
  if (mealType === 'non-veg' && (mealPlan.breakfast || mealPlan.lunch || mealPlan.dinner)) {
    mealTotal += totalPax * 300; 
  }
  
  let subtotal = adultTotal + childTotal + infantTotal + mealTotal;
  
  const discountAmt = subtotal * (promoDiscountPct / 100);
  subtotal = subtotal - discountAmt;
  
  const tax = subtotal * 0.05; // 5% GST
  const finalTotal = subtotal + tax;

  return {
    adultTotal,
    childTotal,
    infantTotal,
    mealTotal,
    subtotal,
    discountAmt,
    tax,
    finalTotal
  };
}
