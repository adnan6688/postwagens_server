import { TPageViews, TTopListing, TUserGrowth } from './analytics.interface';
import User from '../users/user.model';
import Listing from '../listing/listing.model';
import { IsActive } from '../users/user.interface';

const getAnalyticsSummary = async () => {
  const totalUsers = await User.countDocuments({ isActive: IsActive.ACTIVE });

  const listingStatsArr = await Listing.aggregate([
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$viewCount' },
        totalInquiries: { $sum: '$inquiryCount' },
      },
    },
  ]);

  const listingStats = listingStatsArr[0] || {
    totalViews: 0,
    totalInquiries: 0,
  };
  const { totalViews: totalListingViews, totalInquiries: totalListingInquiries } =
    listingStats;

  const engagementRate =
    totalListingViews > 0
      ? (totalListingInquiries / totalListingViews) * 100
      : 0;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // User growth
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: thisMonthStart },
  });
  const newUsersLastMonth = await User.countDocuments({
    createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
  });
  const userGrowth =
    newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : newUsersThisMonth > 0
      ? 100
      : 0;

  // Listing and Engagement growth
  const monthlyListingStatsArr = await Listing.aggregate([
    {
      $match: {
        createdAt: { $gte: lastMonthStart, $lt: nextMonthStart },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        monthlyViews: { $sum: '$viewCount' },
        monthlyInquiries: { $sum: '$inquiryCount' },
      },
    },
  ]);

  const thisMonthId = {
    year: thisMonthStart.getFullYear(),
    month: thisMonthStart.getMonth() + 1,
  };
  const lastMonthId = {
    year: lastMonthStart.getFullYear(),
    month: lastMonthStart.getMonth() + 1,
  };

  const thisMonthData =
    monthlyListingStatsArr.find(
      d => d._id.year === thisMonthId.year && d._id.month === thisMonthId.month,
    ) || { monthlyViews: 0, monthlyInquiries: 0 };
  const lastMonthData =
    monthlyListingStatsArr.find(
      d => d._id.year === lastMonthId.year && d._id.month === lastMonthId.month,
    ) || { monthlyViews: 0, monthlyInquiries: 0 };

  // Listing view growth
  const listingViewGrowth =
    lastMonthData.monthlyViews > 0
      ? ((thisMonthData.monthlyViews - lastMonthData.monthlyViews) /
          lastMonthData.monthlyViews) *
        100
      : thisMonthData.monthlyViews > 0
      ? 100
      : 0;

  // Engagement growth
  const engagementRateThisMonth =
    thisMonthData.monthlyViews > 0
      ? (thisMonthData.monthlyInquiries / thisMonthData.monthlyViews) * 100
      : 0;
  const engagementRateLastMonth =
    lastMonthData.monthlyViews > 0
      ? (lastMonthData.monthlyInquiries / lastMonthData.monthlyViews) * 100
      : 0;

  const engagementGrowth =
    engagementRateLastMonth > 0
      ? ((engagementRateThisMonth - engagementRateLastMonth) /
          engagementRateLastMonth) *
        100
      : engagementRateThisMonth > 0
      ? 100
      : 0;

  return {
    activeUsers: totalUsers,
    listingViews: totalListingViews,
    engagementRate: parseFloat(engagementRate.toFixed(2)),
    growth: {
      users: parseFloat(userGrowth.toFixed(2)),
      listingViews: parseFloat(listingViewGrowth.toFixed(2)),
      engagement: parseFloat(engagementGrowth.toFixed(2)),
    },
  };
};

const getUserGrowth = async (range: string): Promise<TUserGrowth[]> => {
  const now = new Date();
  const data: TUserGrowth[] = [];

  if (range === 'monthly') {
    for (let i = 5; i >= 0; i--) {
      const month = now.getMonth() - i;
      const year = now.getFullYear();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);

      const previousMonthStartDate = new Date(year, month - 1, 1);
      const previousMonthEndDate = new Date(year, month, 1);

      const currentMonthCount = await User.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate },
      });
      const previousMonthCount = await User.countDocuments({
        createdAt: { $gte: previousMonthStartDate, $lt: previousMonthEndDate },
      });

      const percentage =
        previousMonthCount > 0
          ? ((currentMonthCount - previousMonthCount) / previousMonthCount) *
            100
          : currentMonthCount > 0
          ? 100
          : 0;

      data.push({
        label: startDate.toLocaleString('default', { month: 'short' }),
        percentage: parseFloat(percentage.toFixed(2)),
      });
    }
  } else {
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay() - i * 7,
      );
      const weekEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay() - i * 7 + 7,
      );

      const prevWeekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay() - (i + 1) * 7,
      );
      const prevWeekEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay() - (i + 1) * 7 + 7,
      );

      const currentWeekCount = await User.countDocuments({
        createdAt: { $gte: weekStart, $lt: weekEnd },
      });

      const prevWeekCount = await User.countDocuments({
        createdAt: { $gte: prevWeekStart, $lt: prevWeekEnd },
      });

      const percentage =
        prevWeekCount > 0
          ? ((currentWeekCount - prevWeekCount) / prevWeekCount) * 100
          : currentWeekCount > 0
          ? 100
          : 0;

      data.push({
        label: `Week ${4 - i}`,
        percentage: parseFloat(percentage.toFixed(2)),
      });
    }
  }
  return data;
};

const getTopListings = async (): Promise<TTopListing[]> => {


  const listings = await Listing.find() .sort({ viewCount: -1 }).limit(10)  .select('title viewCount inquiryCount');
// @ts-ignore
  return listings.map(listing => ({
    listingTitle: listing.title,
    views: listing.viewCount,
    inquiries: listing.inquiryCount,
    conversionRate:
    // @ts-ignore
      listing.viewCount > 0
        ? parseFloat(
          // @ts-ignore
            ((listing.inquiryCount / listing.viewCount) * 100).toFixed(1),
          )
        : 0,
  }));
};

export const AnalyticsServices = {
  getAnalyticsSummary,
  getUserGrowth,
  getTopListings,
};