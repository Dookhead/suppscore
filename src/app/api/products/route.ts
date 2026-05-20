import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePreWorkoutScore } from '@/lib/scoring/preWorkout';
import { calculateProteinScore } from '@/lib/scoring/protein';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, type, price, servings, servingSize, ingredients, proteinDetails, isNonStim, ownCreatine, url } = data;

    // Calculate the final score before saving, so we can sort the leaderboard
    let finalScore = 0;
    if (type === 'PRE_WORKOUT') {
      const scoreData = calculatePreWorkoutScore(ingredients || [], price, servings, servingSize, isNonStim, ownCreatine);
      finalScore = scoreData.finalScore;
    } else {
      finalScore = calculateProteinScore(price, servings, proteinDetails?.protein || 0, proteinDetails?.calories || 0).finalScore;
    }

    const product = await prisma.product.create({
      data: {
        name,
        type,
        price,
        servings,
        servingSize: servingSize || 0,
        finalScore,
        url: url || null,
        isNonStim: isNonStim || false,
        ownCreatine: ownCreatine || false,
        ingredients: {
          create: ingredients?.map((ing: any) => ({
            name: ing.id, // storing the DB id in the 'name' field for simplicity
            dosage: ing.dosage,
            unit: ing.unit
          })) || []
        },
        proteinDetails: proteinDetails ? {
          create: {
            protein: proteinDetails.protein,
            calories: proteinDetails.calories
          }
        } : undefined
      }
    });

    return NextResponse.json({ success: true, id: product.id });
  } catch (error) {
    console.error('Error saving product:', error);
    return NextResponse.json({ success: false, error: 'Failed to save product' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { finalScore: 'desc' },
      take: 50,
      include: { ingredients: true, proteinDetails: true }
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
