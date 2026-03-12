import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function ensureUser(userId: string) {
  const existing = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!existing) {
    await db.insert(users).values({ id: userId, email: '' });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.query.contacts.findMany({ where: eq(contacts.userId, userId) });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureUser(userId);
  const body = await req.json();

  const [contact] = await db.insert(contacts).values({
    id: randomUUID(),
    userId,
    name: body.name,
    phoneNumber: body.phoneNumber,
    relationship: body.relationship,
    isDefaultRecipient: body.isDefaultRecipient ?? false,
  }).returning();

  return NextResponse.json(contact, { status: 201 });
}
