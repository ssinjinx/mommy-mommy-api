import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const [updated] = await db.update(contacts)
    .set({ name: body.name, phoneNumber: body.phoneNumber, relationship: body.relationship, isDefaultRecipient: body.isDefaultRecipient })
    .where(and(eq(contacts.id, params.id), eq(contacts.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(contacts).where(and(eq(contacts.id, params.id), eq(contacts.userId, userId)));
  return NextResponse.json({ success: true });
}
