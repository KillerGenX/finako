const supabase = require('./db');

exports.getDashboardData = async (organization_id) => {
  try {
    // Get basic stats
    const [salesData, expensesData, productsData, customersData] = await Promise.all([
      // Sales data
      supabase.rpc('get_daily_sales_last_7_days', { org_id: organization_id }),
      
      // Total expenses this month
      supabase
        .from('expenses')
        .select('amount')
        .eq('organization_id', organization_id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      
      // Product count
      supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('organization_id', organization_id),
      
      // Customer count
      supabase
        .from('customers')
        .select('id', { count: 'exact' })
        .eq('organization_id', organization_id)
    ]);

    // Calculate totals
    const totalExpensesThisMonth = expensesData.data?.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0;
    
    return {
      sales_last_7_days: salesData.data || [],
      total_expenses_this_month: totalExpensesThisMonth,
      total_products: productsData.count || 0,
      total_customers: customersData.count || 0
    };
  } catch (error) {
    throw error;
  }
};
