"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Generates a PDF invoice for donation payments
 * @param data Invoice data including transaction details and donor information
 * @returns Path to the generated PDF file
 */
const generateInvoicePdf = async (data) => {
    // Create a directory for invoices if it doesn't exist
    const invoiceDir = path_1.default.join(process.cwd(), 'public/invoices');
    if (!fs_1.default.existsSync(invoiceDir)) {
        fs_1.default.mkdirSync(invoiceDir, { recursive: true });
    }
    // Create a PDF document
    const doc = new pdfkit_1.default({ margin: 50 });
    // Set output file path
    const outputPath = path_1.default.join(invoiceDir, `invoice_${data.tranId}.pdf`);
    const writeStream = fs_1.default.createWriteStream(outputPath);
    // Pipe the PDF output to the file
    doc.pipe(writeStream);
    // Add logo and header
    doc.fontSize(25)
        .text('ব্লাড ডোনার', { align: 'center' })
        .fontSize(15)
        .text('অনুদানের রসিদ', { align: 'center' })
        .moveDown();
    // Add a horizontal line
    doc.moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown();
    // Add transaction information
    doc.fontSize(12)
        .text(`রসিদ নং: ${data.tranId}`, { align: 'right' })
        .text(`তারিখ: ${data.date}`, { align: 'right' })
        .moveDown();
    // Add donor information
    doc.fontSize(14)
        .text('দাতার তথ্য', { underline: true })
        .moveDown(0.5)
        .fontSize(12)
        .text(`নাম: ${data.donorName}`)
        .text(`ইমেইল: ${data.donorEmail}`);
    if (data.donorPhone) {
        doc.text(`ফোন: ${data.donorPhone}`);
    }
    doc.moveDown(2);
    // Add donation details
    doc.fontSize(14)
        .text('অনুদানের বিবরণ', { underline: true })
        .moveDown(0.5);
    // Create a table for donation details
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidth = (doc.page.width - 100) / 2;
    // Draw table headers
    doc.fontSize(12)
        .text('বিবরণ', tableLeft, tableTop)
        .text('মূল্য', tableLeft + colWidth);
    // Draw a line under headers
    doc.moveTo(tableLeft, doc.y + 5)
        .lineTo(doc.page.width - 50, doc.y + 5)
        .stroke();
    // Add table rows
    doc.text('অনুদানের পরিমাণ', tableLeft, doc.y + 15)
        .text(`${data.amount} ${data.currency}`, tableLeft + colWidth, doc.y);
    if (data.organizationName) {
        doc.text('সংগঠনের নাম', tableLeft, doc.y + 15)
            .text(data.organizationName, tableLeft + colWidth, doc.y);
    }
    if (data.paymentMethod) {
        doc.text('পেমেন্ট পদ্ধতি', tableLeft, doc.y + 15)
            .text(data.paymentMethod, tableLeft + colWidth, doc.y);
    }
    // Draw a line under rows
    doc.moveTo(tableLeft, doc.y + 15)
        .lineTo(doc.page.width - 50, doc.y + 15)
        .stroke();
    // Add total
    doc.text('মোট', tableLeft, doc.y + 25)
        .text(`${data.amount} ${data.currency}`, tableLeft + colWidth, doc.y);
    // Draw a line under total
    doc.moveTo(tableLeft, doc.y + 15)
        .lineTo(doc.page.width - 50, doc.y + 15)
        .stroke();
    doc.moveDown(2);
    // Add thank you message
    doc.fontSize(14)
        .text('আপনার অনুদানের জন্য ধন্যবাদ', { align: 'center' })
        .fontSize(12)
        .moveDown(0.5)
        .text('আপনার অনুদান রক্ত সংগ্রহ এবং জীবন বাঁচানোর কাজে সাহায্য করবে।', { align: 'center' });
    // Add footer
    const footerY = doc.page.height - 50;
    doc.fontSize(10)
        .text('© ব্লাড ডোনার - আপনার দান জীবন বাঁচায়', 50, footerY, { align: 'center' });
    // Finalize the PDF
    doc.end();
    // Return the path to the generated PDF
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
            resolve(outputPath);
        });
        writeStream.on('error', (err) => {
            reject(err);
        });
    });
};
exports.default = generateInvoicePdf;
