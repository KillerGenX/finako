const dashboardModel = require('../models/dashboardModel');

exports.getDashboardData = async (req, res, next) => {
  try {
    const data = await dashboardModel.getDashboardData(req.query.organization_id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
