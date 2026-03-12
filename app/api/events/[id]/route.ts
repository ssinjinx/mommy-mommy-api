import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const [updated] = await db.update(events)
    .set({
      title: body.title,
      type: body.type,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      notifyTime: body.notifyTime ? new Date(body.notifyTime) : undefined,
      recurrence: body.recurrence,
      assignedContacts: body.assignedContacts,
      notes: body.notes,
    })
    .where(and(eq(events.id, params.id), eq(events.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(events).where(and(eq(events.id, params.id), eq(events.userId, userId)));
  return NextResponse.json({ success: true });
}
