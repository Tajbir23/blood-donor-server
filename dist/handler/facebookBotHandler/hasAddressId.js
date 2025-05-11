"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bangladeshGeoLoactionData_1 = require("../../utils/bangladeshGeoLoactionData");
const hasAddressId = (targetId) => {
    return bangladeshGeoLoactionData_1.bangladeshGeoData.divisions.some(division => division.id === targetId ||
        division.districts.some(district => district.id === targetId ||
            district.thanas.some(thana => thana.id === targetId)));
};
exports.default = hasAddressId;
