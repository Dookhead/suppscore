import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, image } = body;

    // Simulate network delay for scraping/OCR
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (image) {
      // MOCK OCR RESPONSE
      return NextResponse.json({
        success: true,
        data: {
          name: "Scanned Product",
          type: "PRE_WORKOUT",
          price: 45.99,
          servings: 30,
          servingSize: 15, // grams
          ingredients: [
            { name: "Caffeine", dosage: 250, unit: "mg" },
            { name: "L-Citrulline", dosage: 6, unit: "g" },
            { name: "Beta-Alanine", dosage: 3.2, unit: "g" }
          ]
        }
      });
    }

    if (url) {
      if (url.toLowerCase().includes("protein")) {
        // MOCK PROTEIN POWDER SCRAPE
        return NextResponse.json({
          success: true,
          data: {
            name: "Mock Whey Isolate",
            type: "PROTEIN_POWDER",
            price: 79.99,
            servings: 71,
            servingSize: 32, // grams
            proteinDetails: {
              protein: 25, // grams
              calories: 120
            }
          }
        });
      } else {
        // MOCK PRE-WORKOUT SCRAPE
        return NextResponse.json({
          success: true,
          data: {
            name: "Mock Pre-Workout Extreme",
            type: "PRE_WORKOUT",
            price: 49.99,
            servings: 20,
            servingSize: 22,
            ingredients: [
              { name: "Caffeine", dosage: 300, unit: "mg" },
              { name: "Beta-Alanine", dosage: 3.2, unit: "g" },
              { name: "L-Citrulline", dosage: 8, unit: "g" },
              { name: "Creatine", dosage: 5, unit: "g" },
              { name: "Proprietary Pump Blend", dosage: null, unit: "mg" }
            ]
          }
        });
      }
    }

    return NextResponse.json({ success: false, error: "Provide url or image" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process" }, { status: 500 });
  }
}
