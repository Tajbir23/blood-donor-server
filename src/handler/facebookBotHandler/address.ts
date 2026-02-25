import { bangladeshGeoData } from "../../utils/bangladeshGeoLoactionData";

interface UserAddressData {
    divisionId?: string;
    districtId?: string;
    thanaId?: string;
    latitude?: string;
    longitude?: string;
    phoneNumber?: string;
    bloodGroup?: string;
    fullName?: string;
    awaitingPhone?: boolean;
    flowType?: "register" | "findBlood";
}

export const userAdressMap = new Map<string, UserAddressData>();

// Return array of objects with id for divisions
export const getDivision = async () => {
    return bangladeshGeoData.divisions;
}

// Return array of objects with id for districts
export const getDistrict = async (divisionId: string) => {
    const division = bangladeshGeoData.divisions.find(division => division.id === divisionId);
    return division ? division.districts : [];
}

// Return array of objects with id for thanas
export const getThana = async (districtId: string, divisionId?: string) => {
    let district;
    
    if (divisionId) {
        const division = bangladeshGeoData.divisions.find(division => division.id === divisionId);
        district = division?.districts.find(district => district.id === districtId);
    } else {
        // Search across all divisions if divisionId is not provided
        for (const division of bangladeshGeoData.divisions) {
            district = division.districts.find(district => district.id === districtId);
            if (district) break;
        }
    }
    
    return district ? district.thanas : [];
}
