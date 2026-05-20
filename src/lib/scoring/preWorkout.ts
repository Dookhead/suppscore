import { INGREDIENT_DATABASE, Pathway } from './database';

export interface Ingredient {
  id: string; 
  name: string;
  dosage: number | null; 
  unit: 'mg' | 'g';
}

const MARKET_AVERAGE_COST_PER_SERVING = 1.50;

export function calculatePreWorkoutScore(
  ingredients: Ingredient[],
  price: number,
  servings: number,
  weights?: Record<string, number> // Keep for legacy/UI compatibility if needed, but not primarily used for expert math
) {
  
  // Initialize pathway scores
  const pathwayScores: Record<Pathway, number> = {
    Energy: 0,
    Pump: 0,
    Endurance: 0,
    Focus: 0,
    Absorption: 0
  };

  let synergyBonus = 0;
  let totalClinicalIngredients = 0;

  // 1. Calculate Pathway Contributions
  ingredients.forEach(ing => {
    const dbEntry = INGREDIENT_DATABASE.find(item => item.id === ing.id);
    
    if (dbEntry) {
      if (ing.dosage === null) {
        // Proprietary blend gives 0 points
      } else {
        const clinicalDosage = dbEntry.clinicalDosage;
        let actualDosage = ing.dosage;
        
        const dbIsMg = dbEntry.unit === 'mg';
        if (dbIsMg && ing.unit === 'g') actualDosage *= 1000;
        if (!dbIsMg && ing.unit === 'mg') actualDosage /= 1000;

        const dosageRatio = Math.min(actualDosage / clinicalDosage, 1.0);
        
        if (dosageRatio >= 0.8) {
          totalClinicalIngredients++;
        }

        // Add to pathway score (e.g. 60 weight * 1.0 ratio = 60 points for Pump)
        const points = dbEntry.pathwayWeight * dosageRatio;
        pathwayScores[dbEntry.category] += points;
      }
    }
  });

  // 2. Calculate Base Efficacy and Synergy Bonus
  let totalBaseScore = 0;
  let activePathways = 4; // Energy, Pump, Endurance, Focus. (Absorption is a bonus/modifier).
  
  Object.keys(pathwayScores).forEach(key => {
    const pathway = key as Pathway;
    const score = pathwayScores[pathway];
    
    if (pathway !== 'Absorption') {
      // Cap base contribution at 100 per pathway
      totalBaseScore += Math.min(score, 100);
      
      // Overflow goes to synergy bonus (e.g. Pump scores 120 -> +20 bonus points, scaled down later)
      if (score > 100) {
        synergyBonus += (score - 100) * 0.1; 
      }
    }
  });

  // Base Efficacy is out of 100 (Average of the 4 main pathways)
  // E.g., if you only have 3 ingredients, you might score 100, 100, 100, 0 = 300/4 = 75%
  let baseEfficacy = totalBaseScore / activePathways;

  // Absorption acts as a direct multiplier to the base efficacy (up to 5% boost)
  if (pathwayScores.Absorption > 0) {
    const absorptionRatio = Math.min(pathwayScores.Absorption / 100, 1);
    baseEfficacy *= (1 + (0.05 * absorptionRatio)); 
    baseEfficacy = Math.min(baseEfficacy, 100); // cap base at 100
  }

  // Comprehensiveness Synergy Bonus: +2 points for every clinical ingredient over 5
  if (totalClinicalIngredients > 5) {
    synergyBonus += (totalClinicalIngredients - 5) * 2;
  }

  // 3. True Value Metric
  const listedCostPerServing = servings > 0 ? price / servings : price;
  
  // True Cost = Listed Cost / Base Efficacy
  const effectiveRatio = baseEfficacy > 0 ? baseEfficacy / 100 : 0.01;
  const trueCostPerServing = listedCostPerServing / effectiveRatio;

  const valueRatio = MARKET_AVERAGE_COST_PER_SERVING / (trueCostPerServing || 1); 
  const valueScore = Math.min(Math.max(valueRatio, 0), 1) * 100; // 0 to 100

  // 4. Final Score
  // 70% Base Efficacy + 30% Value Score + Synergy Bonus
  const finalScore = (baseEfficacy * 0.7) + (valueScore * 0.3) + synergyBonus;

  return {
    finalScore: Math.round(finalScore),
    breakdown: {
      pathwayScores: {
        Energy: Math.min(pathwayScores.Energy, 100),
        Pump: Math.min(pathwayScores.Pump, 100),
        Endurance: Math.min(pathwayScores.Endurance, 100),
        Focus: Math.min(pathwayScores.Focus, 100),
        Absorption: Math.min(pathwayScores.Absorption, 100),
      },
      baseEfficacy,
      synergyBonus,
      listedCostPerServing,
      trueCostPerServing,
      valueScore
    }
  };
}
