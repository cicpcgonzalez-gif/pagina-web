import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, drawDate, status } = body;

    if (!name || !description || !price || !drawDate) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const newRaffle = await prisma.raffle.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        drawDate: new Date(drawDate),
        status: status || 'ACTIVE',
        // TODO: El adminId debería obtenerse de la sesión del usuario autenticado
        adminId: 1, 
      },
    });

    return NextResponse.json(newRaffle, { status: 201 });
  } catch (error) {
    console.error('Error al crear la rifa:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
