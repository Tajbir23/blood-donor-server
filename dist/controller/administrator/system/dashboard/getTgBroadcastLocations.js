"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bangladeshGeoLoactionData_1 = require("../../../../utils/bangladeshGeoLoactionData");
/**
 * GET /system/dashboard/tg-broadcast/locations
 *
 * No params           → returns all divisions (id, name)
 * ?divisionId=xxx     → returns districts of that division (id, name)
 * ?districtId=xxx     → returns thanas of that district (id, name)
 *                       (divisionId also needed to locate the district)
 */
const getTgBroadcastLocations = async (req, res) => {
    try {
        const { divisionId, districtId } = req.query;
        if (!divisionId) {
            // Return all divisions
            const divisions = bangladeshGeoLoactionData_1.bangladeshGeoData.divisions.map(d => ({
                id: d.id,
                name: d.name,
            }));
            res.status(200).json({ success: true, data: divisions });
            return;
        }
        const division = bangladeshGeoLoactionData_1.bangladeshGeoData.divisions.find(d => d.id === divisionId);
        if (!division) {
            res.status(404).json({ success: false, message: "Division not found" });
            return;
        }
        if (!districtId) {
            // Return districts of the division
            const districts = division.districts.map(d => ({
                id: d.id,
                name: d.name,
            }));
            res.status(200).json({ success: true, data: districts });
            return;
        }
        const district = division.districts.find(d => d.id === districtId);
        if (!district) {
            res.status(404).json({ success: false, message: "District not found" });
            return;
        }
        // Return thanas of the district
        const thanas = district.thanas.map(t => ({
            id: t.id,
            name: t.name,
        }));
        res.status(200).json({ success: true, data: thanas });
    }
    catch (error) {
        console.error("getTgBroadcastLocations error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.default = getTgBroadcastLocations;
