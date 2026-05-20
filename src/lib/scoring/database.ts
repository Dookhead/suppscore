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
  { id: 'synephrine', name: 'Bitter Orange (Synephrine)', aliases: ['synephrine', 'bitter orange', 'bitter orange extract'], clinicalDosage: 40, unit: 'mg', category: 'Energy', pathwayWeight: 20 },
  { id: 'dynamine', name: 'Dynamine (Methylliberine)', aliases: ['dynamine', 'methylliberine'], clinicalDosage: 100, unit: 'mg', category: 'Energy', pathwayWeight: 25 },
  { id: 'teacrine', name: 'Teacrine (Theacrine)', aliases: ['teacrine', 'theacrine'], clinicalDosage: 100, unit: 'mg', category: 'Energy', pathwayWeight: 25 },
  { id: 'green_tea', name: 'Green Tea Extract (EGCG)', aliases: ['green tea', 'green tea extract', 'egcg'], clinicalDosage: 250, unit: 'mg', category: 'Energy', pathwayWeight: 15 },
  { id: 'guarana', name: 'Guarana Seed Extract', aliases: ['guarana', 'guarana extract', 'guarana seed'], clinicalDosage: 200, unit: 'mg', category: 'Energy', pathwayWeight: 15 },
  { id: 'glucuronolactone', name: 'Glucuronolactone', aliases: ['glucuronolactone'], clinicalDosage: 500, unit: 'mg', category: 'Energy', pathwayWeight: 15 },
  
  // PUMP
  { id: 'citrulline', name: 'L-Citrulline', aliases: ['citrulline', 'l-citrulline', 'citruline', 'l-citruline'], clinicalDosage: 6, unit: 'g', category: 'Pump', pathwayWeight: 60 },
  { id: 'citrulline_malate', name: 'Citrulline Malate (2:1)', aliases: ['citrulline malate', 'l-citrulline malate', 'citruline malate', 'l-citruline malate'], clinicalDosage: 8, unit: 'g', category: 'Pump', pathwayWeight: 60 },
  { id: 'agmatine', name: 'Agmatine Sulfate', aliases: ['agmatine', 'agmatine sulfate'], clinicalDosage: 1000, unit: 'mg', category: 'Pump', pathwayWeight: 25 },
  { id: 'glycerol', name: 'Glycerol Powder', aliases: ['glycerol', 'glycerpump', 'hydroprime'], clinicalDosage: 3, unit: 'g', category: 'Pump', pathwayWeight: 30 },
  { id: 'nitrosigine', name: 'Nitrosigine', aliases: ['nitrosigine', 'inositol-stabilized arginine silicate'], clinicalDosage: 1500, unit: 'mg', category: 'Pump', pathwayWeight: 40 },
  { id: 'norvaline', name: 'L-Norvaline', aliases: ['norvaline', 'l-norvaline'], clinicalDosage: 200, unit: 'mg', category: 'Pump', pathwayWeight: 15 },
  { id: 'vasodrive', name: 'VasoDrive-AP', aliases: ['vasodrive', 'vasodrive-ap'], clinicalDosage: 254, unit: 'mg', category: 'Pump', pathwayWeight: 25 },
  { id: 'beetroot', name: 'Beetroot Extract', aliases: ['beetroot', 'beet root', 'beetroot powder', 'beet root extract'], clinicalDosage: 5, unit: 'g', category: 'Pump', pathwayWeight: 25 },
  { id: 'pine_bark', name: 'Pine Bark Extract', aliases: ['pine bark', 'pine bark extract'], clinicalDosage: 150, unit: 'mg', category: 'Pump', pathwayWeight: 20 },
  { id: 's7', name: 'S7 Blend', aliases: ['s7'], clinicalDosage: 50, unit: 'mg', category: 'Pump', pathwayWeight: 20 },
  { id: 'arginine_akg', name: 'L-Arginine AKG', aliases: ['arginine akg', 'l-arginine akg', 'arginine alpha-ketoglutarate', 'l-arginine alpha-ketoglutarate'], clinicalDosage: 3, unit: 'g', category: 'Pump', pathwayWeight: 20 },
  { id: 'grape_seed', name: 'Grape Seed Extract', aliases: ['grape seed', 'grape seed extract'], clinicalDosage: 300, unit: 'mg', category: 'Pump', pathwayWeight: 20 },
  { id: 'ornithine', name: 'L-Ornithine', aliases: ['ornithine', 'l-ornithine'], clinicalDosage: 2, unit: 'g', category: 'Pump', pathwayWeight: 20 },

  // ENDURANCE & RECOVERY
  { id: 'beta_alanine', name: 'Beta-Alanine', aliases: ['beta alanine', 'beta-alanine', 'carnosyn'], clinicalDosage: 3.2, unit: 'g', category: 'Endurance', pathwayWeight: 50 },
  { id: 'creatine_mono', name: 'Creatine Monohydrate', aliases: ['creatine', 'creatine monohydrate'], clinicalDosage: 5, unit: 'g', category: 'Endurance', pathwayWeight: 40 },
  { id: 'betaine', name: 'Betaine Anhydrous', aliases: ['betaine', 'betaine anhydrous', 'trimethylglycine', 'tmg'], clinicalDosage: 2.5, unit: 'g', category: 'Endurance', pathwayWeight: 30 },
  { id: 'taurine', name: 'L-Taurine', aliases: ['taurine', 'l-taurine'], clinicalDosage: 1, unit: 'g', category: 'Endurance', pathwayWeight: 20 },
  { id: 'elevatp', name: 'elevATP', aliases: ['elevatp'], clinicalDosage: 150, unit: 'mg', category: 'Endurance', pathwayWeight: 25 },
  { id: 'creatine_hcl', name: 'Creatine HCL', aliases: ['creatine hcl', 'creatine hydrochloride'], clinicalDosage: 1.5, unit: 'g', category: 'Endurance', pathwayWeight: 40 },
  { id: 'peako2', name: 'PeakO2', aliases: ['peako2', 'peak o2'], clinicalDosage: 2, unit: 'g', category: 'Endurance', pathwayWeight: 30 },
  { id: 'rhodiola', name: 'Rhodiola Rosea Extract', aliases: ['rhodiola', 'rhodiola rosea', 'rhodiola extract'], clinicalDosage: 300, unit: 'mg', category: 'Endurance', pathwayWeight: 20 },
  { id: 'senactiv', name: 'Senactiv', aliases: ['senactiv'], clinicalDosage: 50, unit: 'mg', category: 'Endurance', pathwayWeight: 25 },
  { id: 'l_carnitine_tartrate', name: 'L-Carnitine L-Tartrate', aliases: ['l-carnitine l-tartrate', 'l-carnitine tartrate', 'carnitine tartrate', 'carnitine l-tartrate'], clinicalDosage: 2, unit: 'g', category: 'Endurance', pathwayWeight: 25 },
  { id: 'tri_creatine_malate', name: 'Tri-Creatine Malate', aliases: ['tri-creatine malate', 'tri creatine malate'], clinicalDosage: 3, unit: 'g', category: 'Endurance', pathwayWeight: 35 },
  { id: 'leucine', name: 'L-Leucine', aliases: ['leucine', 'l-leucine'], clinicalDosage: 3, unit: 'g', category: 'Endurance', pathwayWeight: 15 },
  { id: 'isoleucine', name: 'L-Isoleucine', aliases: ['isoleucine', 'l-isoleucine'], clinicalDosage: 1.5, unit: 'g', category: 'Endurance', pathwayWeight: 10 },
  { id: 'valine', name: 'L-Valine', aliases: ['valine', 'l-valine'], clinicalDosage: 1.5, unit: 'g', category: 'Endurance', pathwayWeight: 10 },
  { id: 'glutamine', name: 'L-Glutamine', aliases: ['glutamine', 'l-glutamine'], clinicalDosage: 5, unit: 'g', category: 'Endurance', pathwayWeight: 15 },

  // FOCUS
  { id: 'l_tyrosine', name: 'L-Tyrosine', aliases: ['tyrosine', 'l-tyrosine'], clinicalDosage: 1000, unit: 'mg', category: 'Focus', pathwayWeight: 40 },
  { id: 'nalt', name: 'N-Acetyl L-Tyrosine (NALT)', aliases: ['n-acetyl l-tyrosine', 'nalt', 'n-acetyl-l-tyrosine'], clinicalDosage: 300, unit: 'mg', category: 'Focus', pathwayWeight: 30 },
  { id: 'alpha_gpc', name: 'Alpha-GPC (50%)', aliases: ['alpha gpc', 'alpha-gpc', 'alpha glycerylphosphorylcholine'], clinicalDosage: 600, unit: 'mg', category: 'Focus', pathwayWeight: 45 },
  { id: 'cdp_choline', name: 'CDP-Choline', aliases: ['cdp choline', 'cdp-choline', 'citicoline'], clinicalDosage: 250, unit: 'mg', category: 'Focus', pathwayWeight: 45 },
  { id: 'theanine', name: 'L-Theanine', aliases: ['theanine', 'l-theanine', 'l- theanine', 'i-theanine'], clinicalDosage: 200, unit: 'mg', category: 'Focus', pathwayWeight: 25 },
  { id: 'huperzine', name: 'Huperzine A 1%', aliases: ['huperzine', 'huperzine a', 'huperzine-a'], clinicalDosage: 10, unit: 'mg', category: 'Focus', pathwayWeight: 25 },
  { id: 'lions_mane', name: "Lion's Mane Mushroom", aliases: ['lions mane', 'lion\'s mane', 'hericium erinaceus'], clinicalDosage: 500, unit: 'mg', category: 'Focus', pathwayWeight: 20 },
  { id: 'bacopa', name: 'Bacopa Monnieri', aliases: ['bacopa', 'bacopa monnieri'], clinicalDosage: 300, unit: 'mg', category: 'Focus', pathwayWeight: 20 },
  { id: 'alcar', name: 'Acetyl-L-Carnitine (ALCAR)', aliases: ['alcar', 'acetyl-l-carnitine', 'acetyl l-carnitine'], clinicalDosage: 1000, unit: 'mg', category: 'Focus', pathwayWeight: 25 },
  { id: 'dmae', name: 'DMAE (Dimethylaminoethanol)', aliases: ['dmae', 'dimethylaminoethanol'], clinicalDosage: 350, unit: 'mg', category: 'Focus', pathwayWeight: 20 },
  { id: 'choline_bitartrate', name: 'Choline Bitartrate', aliases: ['choline bitartrate', 'choline'], clinicalDosage: 1000, unit: 'mg', category: 'Focus', pathwayWeight: 20 },
  { id: 'ginseng', name: 'Panax Ginseng', aliases: ['ginseng', 'panax ginseng'], clinicalDosage: 200, unit: 'mg', category: 'Focus', pathwayWeight: 15 },

  // ABSORPTION & SUPPORT
  { id: 'bioperine', name: 'BioPerine (Black Pepper)', aliases: ['bioperine', 'black pepper', 'piperine', 'piperine extract', 'black pepper extract'], clinicalDosage: 5, unit: 'mg', category: 'Absorption', pathwayWeight: 100 },
  { id: 'astragin', name: 'AstraGin', aliases: ['astragin'], clinicalDosage: 50, unit: 'mg', category: 'Absorption', pathwayWeight: 100 },
  { id: 'ginger', name: 'Ginger Root Extract', aliases: ['ginger', 'ginger root', 'ginger extract'], clinicalDosage: 500, unit: 'mg', category: 'Absorption', pathwayWeight: 20 },
  { id: 'digestive_enzymes', name: 'Digestive Enzymes', aliases: ['digestive enzymes', 'amylase', 'protease', 'lipase', 'lactase', 'cellulase'], clinicalDosage: 100, unit: 'mg', category: 'Absorption', pathwayWeight: 30 },
  { id: 'vitamin_c', name: 'Vitamin C', aliases: ['vitamin c', 'ascorbic acid'], clinicalDosage: 250, unit: 'mg', category: 'Absorption', pathwayWeight: 10 },
  { id: 'vitamin_b3', name: 'Vitamin B3 (Niacin)', aliases: ['vitamin b3', 'niacin', 'niacinamide'], clinicalDosage: 16, unit: 'mg', category: 'Energy', pathwayWeight: 10 },
  { id: 'vitamin_b6', name: 'Vitamin B6', aliases: ['vitamin b6', 'pyridoxine', 'pyridoxine hcl'], clinicalDosage: 2, unit: 'mg', category: 'Energy', pathwayWeight: 10 },
  { id: 'vitamin_b5', name: 'Vitamin B5 (Pantothenic Acid)', aliases: ['vitamin b5', 'pantothenic acid'], clinicalDosage: 5, unit: 'mg', category: 'Energy', pathwayWeight: 10 },
  { id: 'folic_acid', name: 'Folic Acid (Vitamin B9)', aliases: ['folic acid', 'folate', 'vitamin b9'], clinicalDosage: 0.4, unit: 'mg', category: 'Absorption', pathwayWeight: 10 },
  { id: 'vitamin_b12', name: 'Vitamin B12', aliases: ['vitamin b12', 'methylcobalamin', 'cyanocobalamin'], clinicalDosage: 0.006, unit: 'mg', category: 'Energy', pathwayWeight: 10 },
  { id: 'magnesium', name: 'Magnesium', aliases: ['magnesium', 'magnesium oxide', 'magnesium citrate', 'magnesium glycinate'], clinicalDosage: 200, unit: 'mg', category: 'Absorption', pathwayWeight: 10 },
  { id: 'zinc', name: 'Zinc', aliases: ['zinc', 'zinc oxide', 'zinc gluconate', 'zinc picolinate'], clinicalDosage: 11, unit: 'mg', category: 'Absorption', pathwayWeight: 10 },
];

