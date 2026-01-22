/**
 * Сервис для работы с электронной почтой
 */

const log = require('../utils/logger.cjs');

/**
 * Отправка email
 */
async function sendEmail(to, subject, body) {
  // В реальном приложении здесь будет интеграция с почтовым сервисом (например, SendGrid, Mailgun, SMTP)
  log.info(`Email would be sent to: ${to}`);
  log.info(`Subject: ${subject}`);
  log.info(`Body: ${body}`);
  
  // Временная реализация - просто логируем
  return {
    success: true,
    message: 'Email sent successfully (mock)'
  };
}

/**
 * Отправка OTP на email
 */
async function sendOTP(email, otp) {
  const subject = 'Ваш одноразовый пароль';
  const body = `
    <html>
      <body>
        <h2>Ваш одноразовый пароль для входа</h2>
        <p>Ваш OTP: <strong>${otp}</strong></p>
        <p>Этот код действителен в течение 10 минут.</p>
      </body>
    </html>
  `;
  
  return await sendEmail(email, subject, body);
}

/**
 * Отправка подтверждения регистрации
 */
async function sendRegistrationConfirmation(email, userData) {
  const subject = 'Подтверждение регистрации';
  const body = `
    <html>
      <body>
        <h2>Добро пожаловать!</h2>
        <p>Вы успешно зарегистрировались в нашем приложении.</p>
        <p>Ваш email: ${email}</p>
      </body>
    </html>
  `;
  
  return await sendEmail(email, subject, body);
}

module.exports = {
  sendEmail,
  sendOTP,
  sendRegistrationConfirmation
};