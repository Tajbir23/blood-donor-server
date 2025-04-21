import { Request, Response } from "express";
import MoneyDonation from "../../models/donation/moneyDonationSchema";
import { generateNonce, createCSP } from "../../utils/securityUtils";

const getInvoice = async (req: Request, res: Response) => {
    try {
        // Generate a random nonce for CSP
        const nonce = generateNonce();

        const { tran_id } = req.params;
        const donation = await MoneyDonation.findOne({ tran_id });
        
        if (!donation) {
            res.status(404).json({ message: "অনুদান খুঁজে পাওয়া যায়নি" });
            return;
        }
        
        // Format date
        const donationDate = new Date(donation.createdAt || donation.tran_date || new Date());
        const formattedDate = donationDate.toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Generate invoice HTML
        const invoiceHtml = `
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ব্লাড ডোনার ডোনেশন রসিদ #${donation.tran_id}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap');
                
                body {
                    font-family: 'Noto Sans Bengali', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 20px;
                }
                
                .invoice-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: #fff;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                    overflow: hidden;
                    page-break-inside: avoid;
                }
                
                .invoice-header {
                    background-color: #e53935;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                
                .invoice-title {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }
                
                .invoice-subtitle {
                    margin: 5px 0 0;
                    font-size: 16px;
                    font-weight: 500;
                    opacity: 0.9;
                }
                
                .invoice-body {
                    padding: 30px;
                }
                
                .invoice-details {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }
                
                .invoice-info, .donor-info {
                    flex: 1;
                    min-width: 250px;
                }
                
                .invoice-info h3, .donor-info h3 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #eee;
                    color: #e53935;
                }
                
                .donation-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                }
                
                .donation-table th {
                    background-color: #f5f5f5;
                    padding: 12px;
                    text-align: left;
                    border-bottom: 2px solid #e53935;
                }
                
                .donation-table td {
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                }
                
                .amount-row {
                    font-weight: bold;
                    font-size: 18px;
                }
                
                .total-row {
                    font-size: 20px;
                    font-weight: bold;
                    color: #e53935;
                }
                
                .payment-details {
                    margin: 30px 0;
                    background-color: #f8f8f8;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #2196F3;
                }
                
                .payment-details h3 {
                    margin-top: 0;
                    color: #2196F3;
                    border-bottom: 1px solid #e0e0e0;
                    padding-bottom: 10px;
                }
                
                .payment-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                }
                
                .payment-item {
                    margin-bottom: 8px;
                }
                
                .payment-item strong {
                    display: block;
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 3px;
                }
                
                .invoice-footer {
                    text-align: center;
                    margin-top: 40px;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }
                
                .thank-you {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 18px;
                    color: #e53935;
                    font-weight: 500;
                }
                
                .payment-status {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-weight: bold;
                    background-color: #4CAF50;
                    color: white;
                }
                
                @media print {
                    body {
                        background-color: #fff;
                        padding: 0;
                        margin: 0;
                    }
                    
                    .invoice-container {
                        box-shadow: none;
                        margin: 0;
                        max-width: 100%;
                    }
                    
                    .controls {
                        display: none !important;
                    }
                    
                    #loading {
                        display: none !important;
                    }
                    
                    .page-break {
                        page-break-before: always;
                    }
                }
                
                .controls {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin: 20px auto;
                    max-width: 800px;
                }
                
                .btn {
                    padding: 10px 20px;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: 'Noto Sans Bengali', sans-serif;
                    font-size: 16px;
                    transition: background-color 0.3s;
                    text-decoration: none;
                    display: inline-block;
                }
                
                .btn-print {
                    background-color: #e53935;
                }
                
                .btn-print:hover {
                    background-color: #c62828;
                }
                
                .btn-pdf {
                    background-color: #2196F3;
                }
                
                .btn-pdf:hover {
                    background-color: #1976D2;
                }
                
                .logo {
                    max-width: 120px;
                    margin-bottom: 10px;
                }
                
                .qr-code {
                    text-align: center;
                    margin: 20px 0;
                }
                
                .qr-code img {
                    max-width: 150px;
                    border: 1px solid #eee;
                    padding: 10px;
                    background: white;
                }
                
                #loading {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    z-index: 9999;
                    color: white;
                    justify-content: center;
                    align-items: center;
                    font-size: 20px;
                }
            </style>
        </head>
        <body>
            <div id="loading">পিডিএফ তৈরি হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন</div>
            
            <div class="invoice-container" id="invoice">
                <div class="invoice-header">
                    <h1 class="invoice-title">অর্থ অনুদানের রসিদ</h1>
                    <p class="invoice-subtitle">ব্লাড ডোনার</p>
                </div>
                
                <div class="invoice-body">
                    <div class="invoice-details">
                        <div class="invoice-info">
                            <h3>রসিদ তথ্য</h3>
                            <p><strong>রসিদ নং:</strong> ${donation.tran_id}</p>
                            <p><strong>তারিখ:</strong> ${formattedDate}</p>
                            <p><strong>অবস্থা:</strong> <span class="payment-status">${donation.status === 'VALID' ? 'সম্পন্ন' : donation.status}</span></p>
                            ${donation.bank_tran_id ? `<p><strong>ব্যাংক লেনদেন আইডি:</strong> ${donation.bank_tran_id}</p>` : ''}
                        </div>
                        
                        <div class="donor-info">
                            <h3>দাতার তথ্য</h3>
                            <p><strong>নাম:</strong> ${donation.donor_name || 'অজানা'}</p>
                            <p><strong>ইমেইল:</strong> ${donation.donor_email || 'প্রদান করা হয়নি'}</p>
                            <p><strong>ফোন:</strong> ${donation.donor_phone || 'প্রদান করা হয়নি'}</p>
                        </div>
                    </div>
                    
                    <table class="donation-table">
                        <thead>
                            <tr>
                                <th>বিবরণ</th>
                                <th>পরিমাণ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="amount-row">
                                <td>অর্থ অনুদান</td>
                                <td>${donation.amount} ${donation.currency || 'BDT'}</td>
                            </tr>
                            <tr class="total-row">
                                <td>মোট</td>
                                <td>${donation.amount} ${donation.currency || 'BDT'}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    ${donation.card_type || donation.card_brand ? `
                    <div class="payment-details">
                        <h3>পেমেন্ট বিবরণ</h3>
                        <div class="payment-grid">
                            ${donation.card_type ? `<div class="payment-item"><strong>পেমেন্ট পদ্ধতি</strong> ${donation.card_type}</div>` : ''}
                            ${donation.card_brand ? `<div class="payment-item"><strong>কার্ড ব্র্যান্ড</strong> ${donation.card_brand}</div>` : ''}
                            ${donation.card_no ? `<div class="payment-item"><strong>কার্ড নম্বর</strong> ${donation.card_no}</div>` : ''}
                            ${donation.card_issuer ? `<div class="payment-item"><strong>ইস্যুকারী</strong> ${donation.card_issuer}</div>` : ''}
                            ${donation.card_issuer_country ? `<div class="payment-item"><strong>ইস্যুকারী দেশ</strong> ${donation.card_issuer_country}</div>` : ''}
                            ${donation.tran_date ? `<div class="payment-item"><strong>লেনদেনের তারিখ</strong> ${donation.tran_date}</div>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="thank-you">
                        <p>আপনার অবদানের জন্য আন্তরিক ধন্যবাদ!</p>
                        <p>আপনার অনুদান একটি মহৎ উদ্যোগের অংশ। আপনার সহায়তায় আমরা রক্তদাতাদের সহায়তা, প্রশিক্ষণ এবং সচেতনতা কার্যক্রম অব্যাহত রাখতে পারব। একটি জীবন বাঁচাতে আপনার অবদান প্রতিফলিত হবে একটি পরিবারের হাসিতে, একটি মাতার স্বস্তিতে, বা একটি ভবিষ্যতে। শান্তি ও প্রশান্তির এই পথে আপনার সঙ্গী হওয়ার জন্য আপনাকে আন্তরিক কৃতজ্ঞতা জানাই।</p>
                    </div>
                </div>
                
                <div class="invoice-footer">
                    <p>&copy; ${new Date().getFullYear()} ব্লাড ডোনার। সর্বস্বত্ব সংরক্ষিত।</p>
                </div>
            </div>
            
            <div class="controls">
                <button class="btn btn-print" id="printBtn">প্রিন্ট করুন</button>
            </div>
            
            <script nonce="${nonce}">
                // Simple print functionality that doesn't rely on external libraries
                document.getElementById('printBtn').addEventListener('click', function() {
                    console.log('printBtn clicked');
                    window.print();
                });
            </script>
        </body>
        </html>
        `;
        
        // Add CSP header with nonce using the utility function
        res.setHeader('Content-Security-Policy', createCSP(nonce));
        
        // Send HTML response
        res.setHeader('Content-Type', 'text/html');
        res.send(invoiceHtml);
        return;
    } catch (error) {
        res.status(500).json({ message: "সার্ভার ত্রুটি", error: error });
        return;
    }
};

export default getInvoice;
