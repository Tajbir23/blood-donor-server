interface FbUserType {
    psId: string;
    fullName: string;
    phoneNumber: string;
    bloodGroup: string;
    divisionId: string;
    districtId: string;
    thanaId: string;
    lastDonationDate: Date
    latitude: number;
    longitude: number;
    location: {
        type: {
            type: string;
            enum: ['Point'];
        };
        coordinates: number[];
    };
}

export default FbUserType;

