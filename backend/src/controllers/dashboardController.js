const Case = require('../models/Case');
const Task = require('../models/Task');
const Document = require('../models/Document');
const User = require('../models/User');

function buildCaseFilterForUser(user) {
  if (user.role === 'Admin') return {};
  if (user.role === 'Attorney') {
    return { assignedAttorney: user._id };
  }
  if (user.role === 'Assistant') {
    return { assistants: user._id };
  }
  return {};
}

function buildTaskFilterForUser(user) {
  if (user.role === 'Admin') return {};
  if (user.role === 'Attorney') {
    return { assignedTo: user._id };
  }
  if (user.role === 'Assistant') {
    return { assignedTo: user._id };
  }
  return {};
}

async function getOverviewStats(req, res, next) {
  try {
    const now = new Date();
    const soonThreshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const caseFilter = buildCaseFilterForUser(req.user);
    const taskFilter = buildTaskFilterForUser(req.user);

    const activeCasesFilter = {
      ...caseFilter,
      status: { $in: ['Open', 'Pending'] },
    };

    // -----------------------------------
    // BASIC COUNTS
    // -----------------------------------
    const totalActiveCases = await Case.countDocuments(activeCasesFilter);

    const casesClosingSoon = await Case.countDocuments({
      ...activeCasesFilter,
      deadline: {
        $gte: now,
        $lte: soonThreshold,
      },
    });

    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: now },
      status: { $ne: 'Completed' },
    });
    

    // -----------------------------------
    // CASES BY PRIORITY
    // -----------------------------------
    const casesByPriorityAgg = await Case.aggregate([
      { $match: caseFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const casesByPriority = casesByPriorityAgg.map((row) => ({
      priority: row._id,
      count: row.count,
    }));

    // -----------------------------------
    // STATUS DISTRIBUTION
    // -----------------------------------
    const caseStatusAgg = await Case.aggregate([
      { $match: caseFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const caseStatusDistribution = caseStatusAgg.map((row) => ({
      status: row._id,
      count: row.count,
    }));

    // MONTHLY TREND (Last 5 Rolling Months)
    // -----------------------------------

      // Get first day of current month
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get date 4 months ago (to make total 5 months window)
      const fiveMonthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 4,
        1
      );

      const monthlyAgg = await Case.aggregate([
        {
          $match: {
            ...caseFilter,
            createdAt: { $gte: fiveMonthsAgo, $lte: now },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      // Format as YYYY-MM (for frontend)
      const monthlyTrend = monthlyAgg.map((row) => {
        const month = String(row._id.month).padStart(2, "0");

        return {
          date: `${row._id.year}-${month}`,
          count: row.count,
        };
      });

    // -----------------------------------
    // TASK BREAKDOWN (by status — Task has no `category` field)
    // -----------------------------------
    const taskAgg = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: '$status',
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0],
            },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'Completed'] },
                    { $lt: ['$dueDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const taskBreakdown = taskAgg.map((row) => ({
      status: row._id,
      completed: row.completed,
      overdue: row.overdue,
    }));

    // -----------------------------------
    // RISK DISTRIBUTION
    // -----------------------------------
    const highRisk =
      casesByPriority.find((c) => c.priority === 'High')?.count || 0;

    const mediumRisk =
      casesByPriority.find((c) => c.priority === 'Medium')?.count || 0;

    const lowRisk =
      casesByPriority.find((c) => c.priority === 'Low')?.count || 0;

    const riskDistribution = [
      { level: 'High Risk', value: highRisk },
      { level: 'Medium Risk', value: mediumRisk },
      { level: 'Low Risk', value: lowRisk },
    ];

    // -----------------------------------
    // REVENUE
    // caseFilter already scopes to "own cases" for Attorney/Assistant and
    // "all cases" for Admin, so totalRevenue is automatically role-correct.
    // -----------------------------------
    const revenueAgg = await Case.aggregate([
      { $match: caseFilter },
      { $group: { _id: null, total: { $sum: '$feeAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Only Admins get the per-attorney breakdown — everyone else only ever
    // sees their own total above.
    let revenueByAttorney = [];
    if (req.user.role === 'Admin') {
      const byAttorneyAgg = await Case.aggregate([
        {
          $group: {
            _id: '$assignedAttorney',
            revenue: { $sum: '$feeAmount' },
            caseCount: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      const attorneyIds = byAttorneyAgg.map((row) => row._id);
      const attorneys = await User.find({ _id: { $in: attorneyIds } }).select(
        'name email'
      );
      const attorneyById = new Map(
        attorneys.map((a) => [String(a._id), a])
      );

      revenueByAttorney = byAttorneyAgg.map((row) => ({
        attorneyId: row._id,
        attorneyName: attorneyById.get(String(row._id))?.name || 'Unknown',
        revenue: row.revenue,
        caseCount: row.caseCount,
      }));
    }

    return res.json({
      totalActiveCases,
      casesClosingSoon,
      overdueTasks,
      casesByPriority,
      caseStatusDistribution,
      monthlyTrend,
      taskBreakdown,
      riskDistribution,
      totalRevenue,
      revenueByAttorney,
    });
  } catch (err) {
    return next(err);
  }
}

async function getAttentionItems(req, res, next) {
  try {
    const now = new Date();
    const soonThreshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const caseFilter = buildCaseFilterForUser(req.user);
    const taskFilter = buildTaskFilterForUser(req.user);

    const activeCasesFilter = {
      ...caseFilter,
      status: { $in: ['Open', 'Pending'] },
    };

    const [casesClosingSoon, overdueTasks, casesMissingDocuments] =
      await Promise.all([
        Case.find({
          ...activeCasesFilter,
          deadline: {
            $gte: now,
            $lte: soonThreshold,
          },
        })
          .populate('clientId', 'name')
          .populate('assignedAttorney', 'name'),

        Task.find({
          ...taskFilter,
          dueDate: { $lt: now },
          status: { $ne: 'Completed' },
        })
          .populate('caseId', 'title assignedAttorney assistants')
          .populate('assignedTo', 'name'),

        Case.aggregate([
          { $match: activeCasesFilter },
          {
            $lookup: {
              from: Document.collection.name,
              localField: '_id',
              foreignField: 'caseId',
              as: 'documents',
            },
          },
          {
            $match: {
              documents: { $size: 0 },
            },
          },
        ]),
      ]);

    return res.json({
      casesClosingSoon,
      overdueTasks,
      casesMissingDocuments,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getOverviewStats,
  getAttentionItems,
};