const supabase = require('./db');

exports.create = async (customer) => {
  // Insert ke tabel customers
  const { data, error } = await supabase.from('customers').insert([customer]).select().single();
  if (error) throw error;
  return data;
};
