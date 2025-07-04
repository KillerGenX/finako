const supabase = require('./db');

exports.getDashboardData = async (organization_id) => {
  // Penjualan 7 hari terakhir
  const { data: sales7, error: err7 } = await supabase.rpc('get_daily_sales_last_7_days', { org_id: organization_id });
  if (err7) throw err7;
  return {
    sales_last_7_days: sales7 || []
  };
};
