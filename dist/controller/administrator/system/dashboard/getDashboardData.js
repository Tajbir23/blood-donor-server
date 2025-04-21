"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const donationHistorySchema_1 = __importDefault(require("../../../../models/user/donationHistorySchema"));
const getStatistics = async () => {
    const totalDonors = await userSchema_1.default.countDocuments();
    const totalActiveDonors = await userSchema_1.default.countDocuments({
        isActive: true,
        isBanned: false
    });
    const totalDonationCount = await donationHistorySchema_1.default.countDocuments();
    const thisMonthDonations = await donationHistorySchema_1.default.countDocuments({
        createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        }
    });
    return {
        totalDonors,
        totalActiveDonors,
        totalDonationCount,
        thisMonthDonations
    };
};
const getBloodInventory = async () => {
    const bloodData = await userSchema_1.default.aggregate([
        {
            $group: {
                _id: "$bloodGroup",
                count: { $sum: 1 }
            }
        }
    ]);
    const getStatus = (units) => {
        if (units >= 50)
            return 'sufficient';
        if (units >= 20)
            return 'medium';
        if (units >= 10)
            return 'low';
        return 'critical';
    };
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const inventory = allGroups.map(group => {
        const found = bloodData.find(blood => blood.bloodGroup === group);
        const units = found ? found.count : 0;
        return {
            bloodGroup: group,
            units,
            status: getStatus(units)
        };
    });
    const bloodGroupMap = {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
    };
    bloodData.forEach(blood => {
        bloodGroupMap[blood.bloodGroup] = blood.count;
    });
    const labels = Object.keys(bloodGroupMap);
    const data = Object.values(bloodGroupMap);
    return {
        bloodDistributionData: {
            labels,
            data
        },
        inventory
    };
};
const getRecentDonations = async () => {
    const recentDonations = await donationHistorySchema_1.default.find()
        .sort({ createdAt: -1 })
        .limit(5);
    return recentDonations;
};
const getdonationsChartData = async (timeRange) => {
    const now = new Date();
    let startDate;
    let groupFormat;
    if (timeRange === '7days') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        groupFormat = "%Y-%m-%d";
    }
    else {
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDate.setHours(0, 0, 0, 0);
        groupFormat = "%Y-%m";
    }
    const donationsChartData = await donationHistorySchema_1.default.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: now
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: groupFormat,
                        date: "$createdAt"
                    }
                },
                total: { $sum: 1 }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ]);
    const labels = [];
    const data = [];
    if (timeRange === '7days') {
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(now.getDate() - 6 + i);
            const dateKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
            const label = date.toLocaleDateString("bn-BD", {
                day: "numeric",
                month: "long"
            });
            labels.push(label);
            const found = donationsChartData.find(item => item._id === dateKey);
            const total = found ? found.total : 0;
            data.push(total);
        }
    }
    else {
        for (let i = 0; i < 6; i++) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
            const dateKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
            const label = monthDate.toLocaleDateString("bn-BD", {
                month: "long"
            });
            labels.push(label);
            const found = donationsChartData.find(r => r._id === dateKey);
            data.push(found ? found.total : 0);
        }
    }
    return {
        labels,
        data
    };
};
const getDashboardData = async (req, res) => {
    const { timeRange = '7days' } = req.query;
    try {
        const statistics = await getStatistics();
        const bloodInventory = await getBloodInventory();
        const recentDonations = await getRecentDonations();
        const donationsChartData = await getdonationsChartData(timeRange);
        res.status(200).json({
            statistics,
            bloodInventory,
            recentDonations,
            donationsChartData
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard data",
            error: error.message
        });
    }
};
exports.default = getDashboardData;
