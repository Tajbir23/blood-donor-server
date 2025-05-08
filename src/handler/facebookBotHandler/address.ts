import { bangladeshGeoData } from "../../utils/bangladeshGeoLoactionData";

export const userAdressMap = new Map<string, {
    divisionId: string,
    districtId: string,
    thanaId: string,
    latitude: string,
    longitude: string,
    bloodGroup?: string
}>();

// Return array of objects with id for divisions
export const getDivision = () => {
    return bangladeshGeoData.divisions.map((division) => {
        return {
            id: division.id
        }
    })
}

// Return array of objects with id for districts
export const getDistrict = (divisionId: string) => {
    const districts = bangladeshGeoData.divisions.find((division) => 
        division.id === divisionId
    )?.districts.map((district) => {
        return {
            id: district.id
        }
    }) || [];
    
    return districts;
}

// Return array of objects with id for thanas
export const getThana = (districtId: string, divisionId: string) => {
    const thanas = bangladeshGeoData.divisions.find((division) => 
        division.id === divisionId
    )?.districts.find((district) => 
        district.id === districtId
    )?.thanas.map((thana) => {
        return {
            id: thana.id,
            latitude: thana.latitude,
            longitude: thana.longitude
        }
    }) || [];
    
    return thanas;
}
