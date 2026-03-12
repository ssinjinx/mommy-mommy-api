import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts, shoppingLists, smsReplies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Twilio sends form-encoded POST when a reply comes in
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get('From') as string;
  const body = formData.get('Body') as string;

  if (!from || !body) {
    return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
  }

  const cleanNumber = from.replace(/\D/g, '');

  // Find which user this contact belongs to
  const allContacts = await db.query.contacts.findMany();
  const matchedContact = allContacts.find((c) => c.phoneNumber.replace(/\D/g, '') === cleanNumber);

  let shoppingListId: string | null = null;

  if (matchedContact) {
    // Find the most recent active shopping list for this user
    const activeLists = await db.query.shoppingLists.findMany({
      where: eq(shoppingLists.userId, matchedContact.userId),
    });
    const activeList = activeLists.find((l) => l.status === 'active');

    if (activeList) {
      shoppingListId = activeList.id;

      // Parse reply — split by comma or newline, each item gets added
      const items = body.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
      const currentItems = (activeList.items as any[]) ?? [];

      const newItems = items.map((name) => ({
        id: randomUUID(),
        name,
        quantity: 1,
        category: 'Other',
        isPurchased: false,
        addedBy: matchedContact.name,
      }));

      await db.update(shoppingLists)
        .set({ items: [...currentItems, ...newItems], updatedAt: new Date() })
        .where(eq(shoppingLists.id, activeList.id));
    }
  }

  // Log the reply
  await db.insert(smsReplies).values({
    id: randomUUID(),
    fromNumber: from,
    toNumber: formData.get('To') as string ?? '',
    body,
    userId: matchedContact?.userId ?? null,
    shoppingListId,
    processed: !!shoppingListId,
  });

  // Reply back to sender confirming items were added
  const responseMessage = shoppingListId
    ? `Got it! I've added those to my shopping list. Thanks! 🛒`
    : `Thanks for your message!`;

  return new NextResponse(
    `<Response><Message>${responseMessage}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  );
}
