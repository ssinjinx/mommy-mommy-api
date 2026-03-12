import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { shoppingLists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const [updated] = await db.update(shoppingLists)
    .set({ storeName: body.storeName, status: body.status, items: body.items, updatedAt: new Date() })
    .where(and(eq(shoppingLists.id, params.id), eq(shoppingLists.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(shoppingLists).where(and(eq(shoppingLists.id, params.id), eq(shoppingLists.userId, userId)));
  return NextResponse.json({ success: true });
}
