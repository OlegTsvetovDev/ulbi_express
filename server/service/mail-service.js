const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        type: "login", // default
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PSWD,
      },
    });
  }

  async sendActivationMail({ email, activationLink }) {
    // console.log(this);
    // console.log(this.transporter.options.auth);
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Активация аккаунта в сервисе ${process.env.SERVICE_NAME}`,
      html: `
        <div>
          <h1>Для подтверждения регистрации перейдите по ссылке ниже:</h1>
          <a href=${activationLink}>Ссылка</a>
        </div>
      `,
    });

    console.log(`Mail sent to: ${email}`);
  }
}

module.exports = new MailService();
