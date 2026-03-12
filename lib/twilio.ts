import twilio from 'twilio';

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER!;

export const sendSMS = async (to: string, body: string): Promise<string | null> => {
  try {
    const msg = await twilioClient.messages.create({
      body,
      from: TWILIO_FROM,
      to,
    });
    return msg.sid;
  } catch (err) {
    console.error('Twilio send error:', err);
    return null;
  }
};

export const scheduleSMS = async (to: string, body: string, sendAt: Date): Promise<string | null> => {
  try {
    const msg = await twilioClient.messages.create({
      body,
      from: TWILIO_FROM,
      to,
      scheduleType: 'fixed',
      sendAt: sendAt.toISOString(),
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID!,
    });
    return msg.sid;
  } catch (err) {
    console.error('Twilio schedule error:', err);
    return null;
  }
};
