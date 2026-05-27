const OPTIMAL_COST_PER_GRAM_PROTEIN = 0.02; // $0.02 per gram of protein is considered very good

export function calculateProteinScore(
  price: number,
  servings: number,
  proteinPerServing: number, // g
  caloriesPerServing: number
) {
  // 1. Protein Density
  // (Protein grams per serving * 4) / Total Calories per serving
  // Note: 1g protein = 4 calories
  const proteinCalories = proteinPerServing * 4;
  let proteinDensity = caloriesPerServing > 0 ? proteinCalories / caloriesPerServing : 0;
  
  // Cap at 1.0 (100% pure protein)
  proteinDensity = Math.min(Math.max(proteinDensity, 0), 1.0);

  // 2. Cost Per Gram of Pure Protein
  const totalProteinGrams = proteinPerServing * servings;
  const costPerGram = totalProteinGrams > 0 ? price / totalProteinGrams : 0;

  // Cost Efficacy Score scales higher as Cost Per Gram approaches optimal lower bound
  // E.g., if cost is $0.02, ratio is 1.0. If cost is $0.04, ratio is 0.5.
  let costEfficacyScore = costPerGram > 0 ? OPTIMAL_COST_PER_GRAM_PROTEIN / costPerGram : 0;
  
  // Uncapped to allow dynamic adjustment with discounts

  // 3. Formula Score
  // Protein Score = (Protein Density * 50) + (Cost Efficacy Score * 50)
  const finalScore = (proteinDensity * 50) + (costEfficacyScore * 50);

  return {
    finalScore: Math.round(finalScore),
    breakdown: {
      proteinDensity: proteinDensity * 100, // percentage
      costPerGram,
      costEfficacyScore: costEfficacyScore * 100, // scaled out of 50
    }
  };
}
