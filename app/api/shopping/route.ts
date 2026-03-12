import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { shoppingLists, contacts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { sendSMS } from '@/lib/twilio';

async function ensureUser(userId: string) {
  const existing = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!existing) await db.insert(users).values({ id: userId, email: '' });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.query.shoppingLists.findMany({ where: eq(shoppingLists.userId, userId) });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureUser(userId);
  const body = await req.json();

  const [list] = await db.insert(shoppingLists).values({
    id: randomUUID(),
    userId,
    storeName: body.storeName,
    status: 'active',
    items: body.items ?? [],
  }).returning();

  // Send SMS to default contacts announcing the shopping trip
  if (body.notifyContacts) {
    const defaultContacts = await db.query.contacts.findMany({
      where: eq(contacts.userId, userId),
    });
    const recipients = defaultContacts.filter((c) => c.isDefaultRecipient);
    const message = `Hi! I'm stopping by ${body.storeName}. Is there anything you need? Reply with items and I'll add them to my list!`;

    await Promise.all(recipients.map((c) => sendSMS(c.phoneNumber, message)));
  }

  return NextResponse.json(list, { status: 201 });
}
