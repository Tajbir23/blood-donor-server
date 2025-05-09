// Map to store last donation date details
interface LastDonationData {
    year?: string;
    month?: string;
    day?: string;
    flowType?: "first_call" | "update_day" | "update_month" | "update_year" | "day_group1" | "day_group2" | "day_group3" | "day_group4" | "completed";
}

const updateLastDonationMapFb = new Map<string, LastDonationData>();

export default updateLastDonationMapFb;
