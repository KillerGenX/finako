const dashboardModel = require('../models/dashboardModel');

exports.getDashboardData = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const data = await dashboardModel.getDashboardData(organizationId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
