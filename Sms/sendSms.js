import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

const client = twilio(accountSid, authToken);

const sendSMS = async (to, message) => {
  try {
    console.log(`📤 Trying to send to: ${to}`);
console.log(`📨 Message: ${message}`);
    const response = await client.messages.create({
      to,
      body: message,
      messagingServiceSid,
    });
    console.log(`✅ Twilio SID: ${response.sid}, Status: ${response.status}`);
    console.log('✅ SMS sent:', response.sid);
  } catch (err) {
    console.error('❌ Failed to send SMS:', err.message);
  }
};

export default sendSMS;
