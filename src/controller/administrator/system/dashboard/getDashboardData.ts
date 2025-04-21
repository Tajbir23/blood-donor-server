import { Request, Response } from "express";
import userModel from "../../../../models/user/userSchema";
import donationHistoryModel from "../../../../models/user/donationHistorySchema";
import organizationModel from "../../../../models/organization/organizationSchema";

// Simple cache implementation without external dependencies
class SimpleCache {
  private cache: Map<string, { value: any; expiry: number }>;
  private defaultTTL: number;

  constructor(ttlSeconds = 300) {
    this.cache = new Map();
    this.defaultTTL = ttlSeconds * 1000;
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key: string, value: any, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }
}

// Create cache with 5 minute TTL
const dashboardCache = new SimpleCache(300);

const getStatistics = async () => {
    const cacheKey = "dashboard_statistics";
    const cachedStats = dashboardCache.get(cacheKey);
    if (cachedStats) return cachedStats;

    // Combine multiple countDocuments into a single aggregation
    const [userStats, donationStats] = await Promise.all([
        userModel.aggregate([
            {
                $facet: {
                    "totalDonors": [{ $count: "count" }],
                    "totalActiveDonors": [
                        { $match: { isActive: true, isBanned: false } },
                        { $count: "count" }
                    ]
                }
            }
        ]),
        donationHistoryModel.aggregate([
            {
                $facet: {
                    "totalDonationCount": [{ $count: "count" }],
                    "thisMonthDonations": [
                        {
                            $match: {
                                createdAt: {
                                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                    $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                                }
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ])
    ]);

    const statistics = {
        totalDonors: userStats[0]?.totalDonors[0]?.count || 0,
        totalActiveDonors: userStats[0]?.totalActiveDonors[0]?.count || 0,
        totalDonationCount: donationStats[0]?.totalDonationCount[0]?.count || 0,
        thisMonthDonations: donationStats[0]?.thisMonthDonations[0]?.count || 0,
    };

    dashboardCache.set(cacheKey, statistics);
    return statistics;
};

const getBloodInventory = async () => {
    const cacheKey = "blood_inventory";
    const cachedInventory = dashboardCache.get(cacheKey);
    if (cachedInventory) return cachedInventory;

    const bloodData = await userModel.aggregate([
        {
            $group: {
                _id: "$bloodGroup",
                count: { $sum: 1 }
            }
        }
    ])

    const getStatus = (units: number) => {
        if (units >= 50) return 'sufficient';
        if (units >= 20) return 'medium';
        if (units >= 10) return 'low';
        return 'critical';
    }

    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const inventory = allGroups.map(group => {
        const found = bloodData.find(blood => blood._id === group)
        const units = found ? found.count : 0
        return {
            bloodGroup: group,
            units,
            status: getStatus(units)
        }
    })

    const bloodGroupMap = {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
    };

    bloodData.forEach(blood => {
        if (blood._id && bloodGroupMap.hasOwnProperty(blood._id)) {
            bloodGroupMap[blood._id] = blood.count
        }
    })

    const labels = Object.keys(bloodGroupMap)
    const data = Object.values(bloodGroupMap)

    const result = {
        bloodDistributionData: {
            labels,
            data
        },
        inventory
    };

    dashboardCache.set(cacheKey, result);
    return result;
}

const getRecentDonations = async () => {
    const cacheKey = "recent_donations";
    const cachedDonations = dashboardCache.get(cacheKey);
    if (cachedDonations) return cachedDonations;

    const recentDonations = await donationHistoryModel.find()
        .sort({ createdAt: -1 })
        .limit(5)

    dashboardCache.set(cacheKey, recentDonations);
    return recentDonations;
}

const getdonationsChartData = async (timeRange: string) => {
    const cacheKey = `donations_chart_${timeRange}`;
    const cachedChartData = dashboardCache.get(cacheKey);
    if (cachedChartData) return cachedChartData;

    const now = new Date()
    let startDate;
    let groupFormat;

    if(timeRange === '7days'){
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        groupFormat = "%Y-%m-%d";
    } else{
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDate.setHours(0, 0, 0, 0)
        groupFormat = "%Y-%m";
    } 

    const donationsChartData = await donationHistoryModel.aggregate([
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
    ])

    const labels = [];
    const data = [];

    if(timeRange === '7days'){
        for(let i = 0; i < 7; i++){
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
    }else {
        for (let i = 0; i < 6; i++) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
            const dateKey = `${monthDate.getFullYear()}-${String(
              monthDate.getMonth() + 1
            ).padStart(2, "0")}`;

            const label = monthDate.toLocaleDateString("bn-BD", {
                month: "long"
            });

            labels.push(label);
            const found = donationsChartData.find(r => r._id === dateKey);
            data.push(found ? found.total : 0);
        }
    }

    const result = {
        labels,
        data
    };

    dashboardCache.set(cacheKey, result);
    return result;
}

const topOrganizations = async () => {
    const cacheKey = "top_organizations";
    const cachedOrgs = dashboardCache.get(cacheKey);
    if (cachedOrgs) return cachedOrgs;

    const topOrgs = await organizationModel.aggregate([
        { $match: { isActive: true } },
        {
            $lookup: {
                from: 'users',
                let: { orgId: '$_id' },
                pipeline: [
                    { 
                        $match: { 
                            $expr: { 
                                $and: [
                                    { $ifNull: ['$organizationId', false] },
                                    { $in: ['$$orgId', { $ifNull: ['$organizationId', []] }] }
                                ]
                            } 
                        } 
                    }
                ],
                as: 'members'
            }
        },
        {
            $project: {
                organizationName: 1,
                logoImage: 1,
                organizationType: 1,
                description: 1,
                memberCount: { $size: '$members' }
            }
        },
        { $sort: { memberCount: -1 } },
        { $limit: 5 }
    ]);

    dashboardCache.set(cacheKey, topOrgs);
    return topOrgs;
}

const getDashboardData = async (req: Request, res: Response) => {
    const {timeRange = '7days'} = req.query;

    try {
        const [statistics, bloodInventory, recentDonations, donationsChartData, topOrgs, totalOrganizations] = await Promise.all([
            getStatistics(),
            getBloodInventory(),
            getRecentDonations(),
            getdonationsChartData(timeRange as string),
            topOrganizations(),
            organizationModel.countDocuments({isActive: true})
        ]);

        res.status(200).json({
            statistics,
            bloodInventory,
            recentDonations,
            donationsChartData,
            totalOrganizations,
            topOrgs
        })
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard data",
            error: error.message
        })
    }
}

export default getDashboardData;