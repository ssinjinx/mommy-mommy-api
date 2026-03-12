import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, contacts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { scheduleSMS } from '@/lib/twilio';

async function ensureUser(userId: string) {
  const existing = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!existing) await db.insert(users).values({ id: userId, email: '' });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.query.events.findMany({ where: eq(events.userId, userId) });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureUser(userId);
  const body = await req.json();

  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);
  const notifyTime = body.notifyTime ? new Date(body.notifyTime) : null;

  const eventId = randomUUID();
  let twilioScheduledId: string | null = null;

  // Schedule SMS via Twilio at the desired notify time
  if (notifyTime && notifyTime > new Date() && body.assignedContacts?.length > 0) {
    const allContacts = await db.query.contacts.findMany({ where: eq(contacts.userId, userId) });
    const recipients = allContacts.filter((c) => body.assignedContacts.includes(c.id));
    const message = `Reminder: We have ${body.title} at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.${body.notes ? ` ${body.notes}` : ''}`;

    // Schedule to all recipients — save first sid as reference
    const sids = await Promise.all(recipients.map((c) => scheduleSMS(c.phoneNumber, message, notifyTime)));
    twilioScheduledId = sids.find(Boolean) ?? null;
  }

  const [event] = await db.insert(events).values({
    id: eventId,
    userId,
    title: body.title,
    type: body.type,
    startTime,
    endTime,
    notifyTime,
    recurrence: body.recurrence ?? 'none',
    assignedContacts: body.assignedContacts ?? [],
    notes: body.notes,
    twilioScheduledId,
  }).returning();

  return NextResponse.json(event, { status: 201 });
}
