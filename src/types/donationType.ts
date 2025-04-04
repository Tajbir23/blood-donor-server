interface DonationType {
    tran_id: string;
    amount: number;
    status: string;
    donor_name: string;
    donor_email: string;
    donor_phone: string;
    invoice_url: string;
    card_type: string;
    bank_tran_id: string;
    tran_date: string;
    currency: string;
    card_no: string;
    card_issuer: string;
    card_brand: string;
    card_issuer_country: string;
    createdAt?: Date;
}

export default DonationType;
