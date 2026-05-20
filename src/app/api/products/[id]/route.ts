import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { ingredients: true, proteinDetails: true }
    });
    
    if (!product) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    // Format back to what the frontend expects
    const formatted = {
      ...product,
      ingredients: product.ingredients.map((ing: any) => ({
        id: ing.name, // we stored dbId in name
        name: ing.name, 
        dosage: ing.dosage,
        unit: ing.unit
      }))
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}
