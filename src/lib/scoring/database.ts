export type Pathway = 'Energy' | 'Pump' | 'Endurance' | 'Focus' | 'Absorption';

export interface IngredientData {
  id: string;
  name: string;
  aliases?: string[];
  clinicalDosage: number;
  unit: 'mg' | 'g';
  category: Pathway;
  pathwayWeight: number; // Max points this ingredient contributes to its pathway (0 to 100)
}

// Note: A pathway score is capped at 100 for base efficacy, but can overflow for Synergy Bonus.
export const INGREDIENT_DATABASE: IngredientData[] = [
  // ENERGY
  { id: 'caffeine', name: 'Caffeine Anhydrous', aliases: ['caffeine', 'caffiene', 'caff', 'caffeine anhydrous'], clinicalDosage: 200, unit: 'mg', category: 'Energy', pathwayWeight: 70 },
  { id: 'dicaffeine_malate', name: 'Di-Caffeine Malate', aliases: ['dicaffeine', 'infinergy', 'di-caffeine malate', 'dicaffeine malate'], clinicalDosage: 150, unit: 'mg', category: 'Energy', pathwayWeight: 20 },
  { id: 'theobromine', name: 'Theobromine', clinicalDosage: 100, unit: 'mg', category: 'Energy', pathwayWeight: 10 },
  { id: 'yohimbine', name: 'Yohimbine HCL', aliases: ['yohimbine', 'yohimbine hcl'], clinicalDosage: 2.5, unit: 'mg', category: 'Energy', pathwayWeight: 15 },
  { id: 'alpha_yohimbine', name: 'Alpha-Yohimbine', aliases: ['alpha yohimbine', 'rauwolscine', 'alpha-yohimbine'], clinicalDosage: 1.5, unit: 'mg', category: 'Energy', pathwayWeight: 25 },
  { id: 'eria_jarensis', name: 'Eria Jarensis Extract', aliases: ['eria jarensis', 'eria jarensis extract'], clinicalDosage: 150, unit: 'mg', category: 'Energy', pathwayWeight: 30 },
  
  // PUMP
  { id: 'citrulline', name: 'L-Citrulline', aliases: ['citrulline', 'l-citrulline', 'citruline', 'l-citruline'], clinicalDosage: 6, unit: 'g', category: 'Pump', pathwayWeight: 60 },
  { id: 'citrulline_malate', name: 'Citrulline Malate (2:1)', aliases: ['citrulline malate', 'l-citrulline malate', 'citruline malate', 'l-citruline malate'], clinicalDosage: 8, unit: 'g', category: 'Pump', pathwayWeight: 60 },
  { id: 'agmatine', name: 'Agmatine Sulfate', aliases: ['agmatine', 'agmatine sulfate'], clinicalDosage: 1000, unit: 'mg', category: 'Pump', pathwayWeight: 25 },
  { id: 'glycerol', name: 'Glycerol Powder', aliases: ['glycerol', 'glycerpump', 'hydroprime'], clinicalDosage: 3, unit: 'g', category: 'Pump', pathwayWeight: 30 },
  { id: 'nitrosigine', name: 'Nitrosigine', aliases: ['nitrosigine', 'inositol-stabilized arginine silicate'], clinicalDosage: 1500, unit: 'mg', category: 'Pump', pathwayWeight: 40 },
  { id: 'norvaline', name: 'L-Norvaline', aliases: ['norvaline', 'l-norvaline'], clinicalDosage: 200, unit: 'mg', category: 'Pump', pathwayWeight: 15 },
  { id: 'vasodrive', name: 'VasoDrive-AP', aliases: ['vasodrive', 'vasodrive-ap'], clinicalDosage: 254, unit: 'mg', category: 'Pump', pathwayWeight: 25 },

  // ENDURANCE
  { id: 'beta_alanine', name: 'Beta-Alanine', aliases: ['beta alanine', 'beta-alanine', 'carnosyn'], clinicalDosage: 3.2, unit: 'g', category: 'Endurance', pathwayWeight: 50 },
  { id: 'creatine_mono', name: 'Creatine Monohydrate', aliases: ['creatine', 'creatine monohydrate'], clinicalDosage: 5, unit: 'g', category: 'Endurance', pathwayWeight: 40 },
  { id: 'betaine', name: 'Betaine Anhydrous', aliases: ['betaine', 'betaine anhydrous', 'trimethylglycine', 'tmg'], clinicalDosage: 2.5, unit: 'g', category: 'Endurance', pathwayWeight: 30 },
  { id: 'taurine', name: 'L-Taurine', aliases: ['taurine', 'l-taurine'], clinicalDosage: 1, unit: 'g', category: 'Endurance', pathwayWeight: 20 },
  { id: 'elevatp', name: 'elevATP', aliases: ['elevatp'], clinicalDosage: 150, unit: 'mg', category: 'Endurance', pathwayWeight: 25 },

  // FOCUS
  { id: 'l_tyrosine', name: 'L-Tyrosine', aliases: ['tyrosine', 'l-tyrosine'], clinicalDosage: 1000, unit: 'mg', category: 'Focus', pathwayWeight: 40 },
  { id: 'nalt', name: 'N-Acetyl L-Tyrosine (NALT)', aliases: ['n-acetyl l-tyrosine', 'nalt', 'n-acetyl-l-tyrosine'], clinicalDosage: 300, unit: 'mg', category: 'Focus', pathwayWeight: 30 },
  { id: 'alpha_gpc', name: 'Alpha-GPC (50%)', aliases: ['alpha gpc', 'alpha-gpc', 'alpha glycerylphosphorylcholine'], clinicalDosage: 600, unit: 'mg', category: 'Focus', pathwayWeight: 45 },
  { id: 'cdp_choline', name: 'CDP-Choline', aliases: ['cdp choline', 'cdp-choline', 'citicoline'], clinicalDosage: 250, unit: 'mg', category: 'Focus', pathwayWeight: 45 },
  { id: 'theanine', name: 'L-Theanine', aliases: ['theanine', 'l-theanine', 'l- theanine', 'i-theanine'], clinicalDosage: 200, unit: 'mg', category: 'Focus', pathwayWeight: 25 },
  { id: 'huperzine', name: 'Huperzine A 1%', aliases: ['huperzine', 'huperzine a', 'huperzine-a'], clinicalDosage: 10, unit: 'mg', category: 'Focus', pathwayWeight: 25 },
  { id: 'lions_mane', name: "Lion's Mane Mushroom", aliases: ['lions mane', 'lion\'s mane', 'hericium erinaceus'], clinicalDosage: 500, unit: 'mg', category: 'Focus', pathwayWeight: 20 },

  // ABSORPTION
  { id: 'bioperine', name: 'BioPerine (Black Pepper)', aliases: ['bioperine', 'black pepper', 'piperine', 'piperine extract', 'black pepper extract'], clinicalDosage: 5, unit: 'mg', category: 'Absorption', pathwayWeight: 100 },
  { id: 'astragin', name: 'AstraGin', aliases: ['astragin'], clinicalDosage: 50, unit: 'mg', category: 'Absorption', pathwayWeight: 100 },
];

