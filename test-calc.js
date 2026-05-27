const { calculatePreWorkoutScore } = require('./src/lib/scoring/preWorkout');

const ingredients = [
  { id: 'citrulline', name: 'L-Citrulline', dosage: 6, unit: 'g' },
  { id: 'beta_alanine', name: 'Beta-Alanine', dosage: 3.2, unit: 'g' },
  { id: 'caffeine', name: 'Caffeine Anhydrous', dosage: 300, unit: 'mg' }
];

console.log("Original calculations (price: 60):");
const score1 = calculatePreWorkoutScore(ingredients, 60, 30, 15, false, false);
console.log(`Value Score: ${score1.breakdown.valueScore}`);
console.log(`Overall Score: ${score1.finalScore}`);

console.log("\nWith 20% discount (price: 48):");
const score2 = calculatePreWorkoutScore(ingredients, 48, 30, 15, false, false);
console.log(`Value Score: ${score2.breakdown.valueScore}`);
console.log(`Overall Score: ${score2.finalScore}`);

console.log("\nWith 50% discount (price: 30):");
const score3 = calculatePreWorkoutScore(ingredients, 30, 30, 15, false, false);
console.log(`Value Score: ${score3.breakdown.valueScore}`);
console.log(`Overall Score: ${score3.finalScore}`);
