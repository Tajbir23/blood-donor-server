"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThana = exports.getDistrict = exports.getDivision = exports.userAdressMap = void 0;
const bangladeshGeoLoactionData_1 = require("../../utils/bangladeshGeoLoactionData");
exports.userAdressMap = new Map();
// Return array of objects with id for divisions
const getDivision = async () => {
    return bangladeshGeoLoactionData_1.bangladeshGeoData.divisions;
};
exports.getDivision = getDivision;
// Return array of objects with id for districts
const getDistrict = async (divisionId) => {
    const division = bangladeshGeoLoactionData_1.bangladeshGeoData.divisions.find(division => division.id === divisionId);
    return division ? division.districts : [];
};
exports.getDistrict = getDistrict;
// Return array of objects with id for thanas
const getThana = async (districtId, divisionId) => {
    let district;
    if (divisionId) {
        const division = bangladeshGeoLoactionData_1.bangladeshGeoData.divisions.find(division => division.id === divisionId);
        district = division === null || division === void 0 ? void 0 : division.districts.find(district => district.id === districtId);
    }
    else {
        // Search across all divisions if divisionId is not provided
        for (const division of bangladeshGeoLoactionData_1.bangladeshGeoData.divisions) {
            district = division.districts.find(district => district.id === districtId);
            if (district)
                break;
        }
    }
    return district ? district.thanas : [];
};
exports.getThana = getThana;
