import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'atharvapatange07@gmail.com',
    pass: 'brkivwmgbxrcorsu',
  },
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { recipients, subject, content, htmlContent } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'No content provided' });
    }

    // Use HTML content if provided, otherwise convert plain text
    const emailContent = htmlContent || content.replace(/\n/g, '<br>');

    const mailOptions = {
      from: 'QuickCourt <noreply@quickcourt.com>',
      to: recipients.join(', '),
      subject: subject || 'Meeting Summary',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">
            Meeting Summary
          </h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; line-height: 1.6;">
            ${emailContent}
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This summary was generated using AI-powered meeting analysis.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
