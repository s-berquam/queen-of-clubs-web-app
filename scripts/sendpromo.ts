// ES module / TypeScript version
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!

const client = twilio(accountSid, authToken)

async function sendTest() {
  try {
    const message = await client.messages.create({
      body: 'Hi! Testing, testing',
      from: '+18774129530',
      to: '+17013886428'
    })
    console.log('✅ Message sent! SID:', message.sid)
  } catch (err) {
    console.error('❌ Twilio error:', err)
  }
}

sendTest()