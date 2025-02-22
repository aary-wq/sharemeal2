const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReceiptGenerator {
    static async generateReceipt(payment, donation) {
        const doc = new PDFDocument();
        const fileName = `receipt-${payment._id}.pdf`;
        const filePath = path.join(__dirname, '../uploads/receipts', fileName);

        // Ensure directory exists
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        // Pipe PDF to file
        doc.pipe(fs.createWriteStream(filePath));

        // Add content
        doc.image('public/logo.png', 50, 50, { width: 100 })
           .fontSize(20)
           .text('ShareMeal Donation Receipt', 180, 80);

        doc.moveDown()
           .fontSize(14)
           .text(`Receipt Number: ${payment.receipt.number}`)
           .text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`)
           .text(`Amount: ${payment.currency.toUpperCase()} ${payment.amount}`)
           .text(`Payment Method: Card payment`)
           .text(`Status: ${payment.status}`);

        doc.moveDown()
           .fontSize(12)
           .text('Thank you for your generous donation!');

        // Finalize PDF
        doc.end();

        return `/receipts/${fileName}`;
    }
}

module.exports = ReceiptGenerator; 