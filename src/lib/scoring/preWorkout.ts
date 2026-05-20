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
  servingSize?: number | null,
  isNonStim: boolean = false,
  ownCreatine: boolean = false
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

  // Clone and auto-inject creatine if user supplements separately and it is not already in the product
  const activeIngredients = [...ingredients];
  if (ownCreatine && !activeIngredients.some(ing => ing.id === 'creatine_mono' || ing.id === 'creatine_hcl' || ing.id === 'tri_creatine_malate')) {
    activeIngredients.push({
      id: 'creatine_mono',
      name: 'Creatine Monohydrate (Supplemented Separately)',
      dosage: 5,
      unit: 'g'
    });
  }

  // 1. Calculate Pathway Contributions
  activeIngredients.forEach(ing => {
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

        // Apply a "Label-Dressing Penalty" for sub-therapeutic doses (under 50% clinical dose)
        let adjustedRatio = dosageRatio;
        if (dosageRatio >= 0.8) {
          adjustedRatio = 1.0; // Full credit for solid clinical dose
        } else if (dosageRatio < 0.5) {
          adjustedRatio = Math.pow(dosageRatio, 1.5); // Exponential decay penalty for dustings
        }

        // Add to pathway score
        const points = dbEntry.pathwayWeight * adjustedRatio;
        pathwayScores[dbEntry.category] += points;
      }
    }
  });

  // 2. Calculate Base Efficacy and Synergy Bonus
  let totalBaseScore = 0;
  let activePathways = isNonStim ? 3 : 4; // Exclude Energy pathway if non-stimulant formula
  
  Object.keys(pathwayScores).forEach(key => {
    const pathway = key as Pathway;
    const score = pathwayScores[pathway];
    
    if (pathway !== 'Absorption') {
      if (isNonStim && pathway === 'Energy') {
        return; // Skip Energy pathway calculations
      }
      
      // Cap base contribution at 100 per pathway
      totalBaseScore += Math.min(score, 100);
      
      // Overflow goes to synergy bonus (e.g. Pump scores 120 -> +20 bonus points, scaled down later)
      if (score > 100) {
        synergyBonus += (score - 100) * 0.1; 
      }
    }
  });

  // Base Efficacy is out of 100 (Average of the active main pathways)
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

  // 3. Rethought Scoop Economics & Efficacy per Dollar
  const listedCostPerServing = servings > 0 ? price / servings : price;

  // A: Calculate Active Ingredient Density %
  let totalActiveMassG = 0;
  activeIngredients.forEach(ing => {
    if (ing.dosage !== null) {
      let mass = ing.dosage;
      if (ing.unit === 'mg') {
        mass /= 1000;
      }
      totalActiveMassG += mass;
    }
  });

  let activeDensityPct = 0;
  if (servingSize && servingSize > 0) {
    activeDensityPct = Math.min((totalActiveMassG / servingSize) * 100, 100);
  }

  // B: Calculate Cost per Active Gram
  let costPerActiveGram = 0;
  if (totalActiveMassG > 0) {
    costPerActiveGram = listedCostPerServing / totalActiveMassG;
  }

  // C: Calculate Efficacy Per Dollar and Value Score
  // Benchmark: 70% efficacy for $1.50/serving (gives 46.67 points/dollar)
  const efficacyPerDollar = listedCostPerServing > 0 ? baseEfficacy / listedCostPerServing : 0;
  const benchmarkEfficacyPerDollar = 70 / 1.50; 
  const valueRatio = benchmarkEfficacyPerDollar > 0 ? efficacyPerDollar / benchmarkEfficacyPerDollar : 0;
  const valueScore = Math.min(valueRatio * 100, 100); // 0 to 100

  // 4. Final Score
  // 70% Base Efficacy + 30% Value Score + Synergy Bonus
  const finalScore = (baseEfficacy * 0.7) + (valueScore * 0.3) + synergyBonus;

  return {
    finalScore: Math.round(finalScore),
    breakdown: {
      pathwayScores: {
        Energy: isNonStim ? 0 : Math.min(pathwayScores.Energy, 100),
        Pump: Math.min(pathwayScores.Pump, 100),
        Endurance: Math.min(pathwayScores.Endurance, 100),
        Focus: Math.min(pathwayScores.Focus, 100),
        Absorption: Math.min(pathwayScores.Absorption, 100),
      },
      baseEfficacy,
      synergyBonus,
      listedCostPerServing,
      efficacyPerDollar,
      activeDensityPct,
      costPerActiveGram,
      valueScore,
      isNonStim,
      ownCreatine
    }
  };
}
