const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `An-Najaat Charity <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // SendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // Mailtrap for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    // Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };

    // Create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to An-Najaat Charity!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for 10 minutes)');
  }

  async sendVerification() {
    await this.send('verification', 'Please verify your email address');
  }
};

// Send receipt email for donations
exports.sendReceiptEmail = async (donation) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: donation.donor.email,
    subject: `Donation Receipt - ${donation.receiptNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #2e7d32; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .receipt { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .amount { font-size: 24px; color: #2e7d32; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>An-Najaat Islami Samaj Kallyan Parishad</h1>
            <p>Donation Receipt</p>
          </div>
          
          <div class="content">
            <p>Assalamu Alaikum ${donation.donor.name},</p>
            <p>Thank you for your generous donation. May Allah accept it from you and reward you abundantly.</p>
            
            <div class="receipt">
              <h2>Receipt Details</h2>
              <p><strong>Receipt Number:</strong> ${donation.receiptNumber}</p>
              <p><strong>Date:</strong> ${new Date(donation.donationDate).toLocaleDateString()}</p>
              <p><strong>Donation Type:</strong> ${donation.donationType}</p>
              <p><strong>Amount:</strong> <span class="amount">BDT ${donation.amount.toLocaleString()}</span></p>
              <p><strong>Payment Method:</strong> ${donation.paymentMethod}</p>
              <p><strong>Status:</strong> ${donation.paymentStatus}</p>
            </div>
            
            <p>Your donation will be used for:</p>
            <ul>
              <li>Zakat distribution to needy families</li>
              <li>Islamic education programs</li>
              <li>Annual Waz Mahfil arrangements</li>
              <li>Social welfare activities</li>
            </ul>
            
            <p>May Allah bless you and your family.</p>
          </div>
          
          <div class="footer">
            <p>An-Najaat Islami Samaj Kallyan Parishad</p>
            <p>লাকেশ্বর বাজার, ছাতক, সুনামগঞ্জ</p>
            <p>Email: info@an-najaat.org | Phone: +880XXXXXXXXXX</p>
            <p>© ${new Date().getFullYear()} An-Najaat Charity. All rights reserved.</p>
          </div>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    donation.receiptSent = true;
    donation.emailReceiptId = mailOptions.messageId;
    await donation.save();
  } catch (error) {
    console.error('Error sending receipt email:', error);
  }
};

// Send general email
exports.sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};