const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Bad Request' };
  }

  const { fields, total, name } = payload;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const pad = (s) => String(s).padEnd(18);
  const lines = [
    '=========================================',
    '  SOCAL VIN VERIFICATION',
    '  New Appointment Request',
    '=========================================',
    '',
    ...Object.entries(fields).map(([k, v]) => `  ${pad(k + ':')} ${v}`),
    '',
    '-----------------------------------------',
    `  ESTIMATED TOTAL:    ${total}`,
    '-----------------------------------------',
    '',
    'Sent from speedyvin.net',
  ];

  try {
    await transporter.sendMail({
      from: `"SoCal VIN Verification" <${process.env.GMAIL_USER}>`,
      to: 'Appointments@speedyvin.net',
      subject: `VIN Appointment Request — ${name}`,
      text: lines.join('\n'),
    });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Mail error:', err);
    return { statusCode: 500, body: JSON.stringify({ success: false }) };
  }
};
