/**
 * USDA FoodData Central sample (SR Legacy).
 * Macros are per 100 g from nutrient numbers 205, 203, 204, 291, and 307.
 * Rows marked precision "full" were read from the FDC food endpoint on 18 Oct 2026.
 * Rows marked "abridged" were read from the FDC abridged payload the same day (the full endpoint rate-limited the rest);
 * USDA rounds some of those figures (for example 28.17 g carbohydrate may show as 28.2).
 * FODMAP is not a USDA field. Tags are set only where carb-loading-evidence.md names the food.
 * Chocolate milk is tagged HIGH because that note names milk / lactose; the row itself is reduced-fat chocolate milk.
 * Banana is tagged LOW for a firm banana; the USDA row is generic raw banana.
 * Oats are tagged LOW with the research caveat "moderate portions".
 * Cornmeal is the dry degermed yellow row (polenta is cooked from it). Cooked polenta is not a separate row here.
 */

export type FoodPrecision = "full" | "abridged";
export type Fodmap = "LOW" | "HIGH" | null;

export type FoodSeed = {
  id: number;
  fdcId: number;
  name: string;
  category: string;
  carbsPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  sodiumMgPer100g: number;
  portionG: number | null;
  portionLabel: string | null;
  fodmap: Fodmap;
  precision: FoodPrecision;
};

export const FOODS: FoodSeed[] = [
  food(1, 168878, "Rice, white, long-grain, regular, enriched, cooked", "Cereal Grains and Pasta", 28.17, 2.69, 0.28, 0.4, 1, 158, "1 cup", "LOW", "full"),
  food(2, 169737, "Pasta, cooked, enriched, without added salt", "Cereal Grains and Pasta", 30.86, 5.8, 0.93, 1.8, 1, 116, "1 cup lasagne", "HIGH", "full"),
  food(3, 173944, "Bananas, raw", "Fruits and Fruit Juices", 22.84, 1.09, 0.33, 2.6, 1, 126, "1 NLEA serving", "LOW", "full"),
  food(4, 174924, "Bread, white, commercially prepared (includes soft bread crumbs)", "Baked Products", 49.42, 8.85, 3.33, 2.7, 490, 29, "1 slice", "HIGH", "full"),
  food(5, 169640, "Honey", "Sweets", 82.4, 0.3, 0, 0.2, 4, 339, "1 cup", "HIGH", "full"),
  food(6, 170440, "Potatoes, boiled, cooked without skin, flesh, without salt", "Vegetables and Vegetable Products", 20.01, 1.71, 0.1, 1.8, 5, 125, '1 small (1-3/4" to 2-1/2" dia.)', "LOW", "full"),
  food(7, 170276, "Syrup, maple, Canadian", "Sweets", 67.38, 0, 0, 0, 9, 80, "60 ml", "LOW", "full"),
  food(8, 169641, "Jams and preserves", "Sweets", 68.86, 0.37, 0.07, 1.1, 32, 20, "1 tbsp", "LOW", "full"),
  food(9, 170250, "Snacks, rice cakes, brown rice, plain, unsalted", "Snacks", 81.5, 8.2, 2.8, 4.2, 26, null, null, null, "abridged"),
  food(10, 173424, "Egg, whole, cooked, hard-boiled", "Dairy and Egg Products", 1.12, 12.58, 10.61, 0, 124, 8.5, "1 tbsp", null, "full"),
  food(11, 171477, "Chicken, broilers or fryers, breast, meat only, cooked, roasted", "Poultry Products", 0, 31.02, 3.57, 0, 74, 140, "1 cup, chopped or diced", null, "full"),
  food(12, 171956, "Fish, cod, Atlantic, cooked, dry heat", "Finfish and Shellfish Products", 0, 22.83, 0.86, 0, 78, 85, "3 oz", null, "full"),
  food(13, 173905, "Cereals, oats, regular and quick, unenriched, cooked with water (includes boiling and microwaving), without salt", "Breakfast Cereals", 12, 2.54, 1.52, 1.7, 4, 14.6, "1 tbsp", "LOW", "full"),
  food(14, 174536, "Soup, chicken broth, ready-to-serve", "Soups, Sauces, and Gravies", 0.44, 0.64, 0.21, 0, 371, null, null, null, "abridged"),
  food(15, 172746, "Crackers, saltines (includes oyster, soda, soup)", "Baked Products", 74, 9.46, 8.64, 2.8, 941, null, null, null, "abridged"),
  food(16, 168483, "Sweet potato, cooked, baked in skin, flesh, without salt", "Vegetables and Vegetable Products", 20.71, 2.01, 0.15, 3.3, 36, 180, "1 large", null, "full"),
  food(17, 168867, "Cornmeal, degermed, enriched, yellow", "Cereal Grains and Pasta", 79.4, 7.11, 1.75, 3.9, 7, null, null, null, "abridged"),
  food(18, 169098, "Orange juice, raw (Includes foods for USDA's Food Distribution Program)", "Fruits and Fruit Juices", 10.4, 0.7, 0.2, 0.2, 1, 31, "1 fl oz", null, "full"),
  food(19, 174648, "Cereals ready-to-eat, RALSTON Corn Flakes", "Breakfast Cereals", 88, 5.9, 0.91, 2.7, 571, null, null, null, "abridged"),
  food(20, 173450, "Milk, chocolate, fluid, commercial, reduced fat, with added calcium", "Dairy and Egg Products", 12.1, 2.99, 1.9, 0.7, 66, null, null, null, "abridged"),
];

export const FOOD_ID = {
  rice: 1,
  pasta: 2,
  banana: 3,
  bread: 4,
  honey: 5,
  potato: 6,
  maple: 7,
  jam: 8,
  riceCake: 9,
  egg: 10,
  chicken: 11,
  cod: 12,
  oats: 13,
  broth: 14,
  saltine: 15,
  sweetPotato: 16,
  cornmeal: 17,
  orangeJuice: 18,
  cornFlakes: 19,
  chocolateMilk: 20,
} as const;

/** Low-FODMAP ids first, then the high-FODMAP staples the research names. */
export const FODMAP_EXAMPLE_IDS = [
  FOOD_ID.rice,
  FOOD_ID.potato,
  FOOD_ID.maple,
  FOOD_ID.banana,
  FOOD_ID.oats,
  FOOD_ID.jam,
  FOOD_ID.cornmeal,
  FOOD_ID.pasta,
  FOOD_ID.bread,
  FOOD_ID.honey,
] as const;

export function foodById(id: number): FoodSeed {
  const found = FOODS.find((item) => item.id === id);
  if (!found) throw new Error(`Missing food ${id}`);
  return found;
}

/** Grams of a food that supply `carbsG`, from that food's USDA carbohydrate density. */
export function gramsForCarbs(foodId: number, carbsG: number): number {
  const food = foodById(foodId);
  if (food.carbsPer100g <= 0) return 0;
  return Math.round((carbsG / food.carbsPer100g) * 100);
}

function food(
  id: number,
  fdcId: number,
  name: string,
  category: string,
  carbsPer100g: number,
  proteinPer100g: number,
  fatPer100g: number,
  fiberPer100g: number,
  sodiumMgPer100g: number,
  portionG: number | null,
  portionLabel: string | null,
  fodmap: Fodmap,
  precision: FoodPrecision,
): FoodSeed {
  return {
    id,
    fdcId,
    name,
    category,
    carbsPer100g,
    proteinPer100g,
    fatPer100g,
    fiberPer100g,
    sodiumMgPer100g,
    portionG,
    portionLabel,
    fodmap,
    precision,
  };
}
