import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/user — get or create current user record
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) {
    [user] = await db.insert(users).values({ id: userId, email: '' }).returning();
  }

  return NextResponse.json(user);
}
