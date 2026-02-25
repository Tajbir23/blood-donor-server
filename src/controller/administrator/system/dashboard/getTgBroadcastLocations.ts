import { Request, Response } from "express";
import { bangladeshGeoData } from "../../../../utils/bangladeshGeoLoactionData";

/**
 * GET /system/dashboard/tg-broadcast/locations
 *
 * No params           → returns all divisions (id, name)
 * ?divisionId=xxx     → returns districts of that division (id, name)
 * ?districtId=xxx     → returns thanas of that district (id, name)
 *                       (divisionId also needed to locate the district)
 */
const getTgBroadcastLocations = async (req: Request, res: Response) => {
    try {
        const { divisionId, districtId } = req.query as Record<string, string>;

        if (!divisionId) {
            // Return all divisions
            const divisions = bangladeshGeoData.divisions.map(d => ({
                id: d.id,
                name: d.name,
            }));
            res.status(200).json({ success: true, data: divisions });
            return;
        }

        const division = bangladeshGeoData.divisions.find(d => d.id === divisionId);
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

    } catch (error) {
        console.error("getTgBroadcastLocations error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default getTgBroadcastLocations;
