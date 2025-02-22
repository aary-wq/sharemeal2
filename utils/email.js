const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
};

exports.sendPaymentConfirmation = async (payment) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: payment.email,
        subject: 'ShareMeal - Donation Receipt',
        html: `
            <h2>Thank you for your donation!</h2>
            <p>Your payment of ${payment.currency.toUpperCase()} ${payment.amount} has been processed successfully.</p>
            <p>Receipt Number: ${payment.receipt.number}</p>
            <p><a href="${process.env.BASE_URL}/api/payment/receipt/${payment._id}">Download Receipt</a></p>
            <p>Thank you for making a difference!</p>
        `,
        attachments: [{
            filename: `receipt-${payment._id}.pdf`,
            path: path.join(__dirname, '..', payment.receipt.url)
        }]
    };

    await transporter.sendMail(mailOptions);
}; 