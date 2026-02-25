import { Request, Response } from "express";
import TelegramUserModel from "../../../../models/telegram/telegramUserSchema";

/**
 * GET /system/dashboard/tg-broadcast/count
 * Returns how many Telegram users match the given filters.
 *
 * Query params (all optional):
 *   bloodGroup       – comma‑separated values, e.g. "A+,B-,O+"
 *   divisionId       – exact match
 *   districtId       – exact match
 *   thanaId          – exact match
 *   lastDonationFrom – ISO date  (≥ this date)
 *   lastDonationTo   – ISO date  (≤ this date)
 *   neverDonated     – "true"  (users whose lastDonationDate is null)
 *   registeredFrom   – ISO date (createdAt ≥)
 *   registeredTo     – ISO date (createdAt ≤)
 */
const getTgBroadcastCount = async (req: Request, res: Response) => {
    try {
        const filter = buildFilter(req.query as Record<string, string>);
        const count = await TelegramUserModel.countDocuments(filter);
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error("getTgBroadcastCount error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export function buildFilter(q: Record<string, string>) {
    const filter: Record<string, unknown> = {};

    if (q.bloodGroup) {
        const groups = q.bloodGroup.split(",").map(g => g.trim()).filter(Boolean);
        if (groups.length) filter.bloodGroup = { $in: groups };
    }

    if (q.divisionId) filter.divisionId = q.divisionId;
    if (q.districtId) filter.districtId = q.districtId;
    if (q.thanaId)    filter.thanaId    = q.thanaId;

    // Last donation date filter
    if (q.neverDonated === "true") {
        filter.lastDonationDate = null;
    } else if (q.lastDonationFrom || q.lastDonationTo) {
        const dateFilter: Record<string, Date> = {};
        if (q.lastDonationFrom) dateFilter.$gte = new Date(q.lastDonationFrom);
        if (q.lastDonationTo)   dateFilter.$lte = new Date(q.lastDonationTo);
        filter.lastDonationDate = dateFilter;
    }

    // Registration date filter
    if (q.registeredFrom || q.registeredTo) {
        const regFilter: Record<string, Date> = {};
        if (q.registeredFrom) regFilter.$gte = new Date(q.registeredFrom);
        if (q.registeredTo)   regFilter.$lte = new Date(q.registeredTo);
        filter.createdAt = regFilter;
    }

    return filter;
}

export default getTgBroadcastCount;
