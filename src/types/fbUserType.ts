interface FbUserType {
    psId: string;
    fullName: string;
    bloodGroup: string;
    divisionId: string;
    districtId: string;
    thanaId: string;
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

