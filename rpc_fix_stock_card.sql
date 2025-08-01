-- PERBAIKAN RPC get_stock_card_report
-- Berdasarkan skema database yang sebenarnya

CREATE OR REPLACE FUNCTION public.get_stock_card_report(
    p_start_date timestamptz,
    p_end_date timestamptz,
    p_item_type text,
    p_item_id uuid,
    p_outlet_id uuid,  -- TAMBAH PARAMETER OUTLET
    p_initial_stock numeric
)
RETURNS TABLE(
    created_at timestamptz,
    movement_type character varying,
    ref_text text,
    item_name text,
    quantity_change numeric,
    balance numeric
)
LANGUAGE sql
AS $$
WITH movements AS (
  -- CASE 1: Ingredient Stock Movements (Bahan Baku)
  (SELECT 
    m.created_at, 
    m.movement_type, 
    COALESCE(m.ref, 'Tanpa keterangan') as ref_text,  -- field 'ref' di ingredient_stock_movements
    i.name AS item_name, 
    m.quantity::NUMERIC as quantity_change  -- field 'quantity' di ingredient_stock_movements
  FROM public.ingredient_stock_movements m 
  LEFT JOIN public.ingredients i ON m.ingredient_id = i.id
  WHERE m.ingredient_id = p_item_id 
    AND p_item_type = 'bahan baku'
    AND m.outlet_id = p_outlet_id
  )
  
  UNION ALL
  
  -- CASE 2: Product Stock Movements (untuk produk simple)
  (SELECT 
    m.created_at, 
    m.movement_type, 
    COALESCE(m.ref_text, 'Tanpa keterangan') as ref_text,  -- field 'ref_text' di product_stock_movements
    p.name AS item_name, 
    m.quantity_change::NUMERIC  -- field 'quantity_change' di product_stock_movements
  FROM public.product_stock_movements m 
  LEFT JOIN public.products p ON m.product_id = p.id
  WHERE m.product_id = p_item_id 
    AND p_item_type = 'produk'
    AND m.outlet_id = p_outlet_id
    AND m.variant_id IS NULL  -- pastikan ini untuk produk simple, bukan variant
  )
  
  UNION ALL
  
  -- CASE 3: Product Stock Movements (untuk variants)
  (SELECT 
    m.created_at, 
    m.movement_type, 
    COALESCE(m.ref_text, 'Tanpa keterangan') as ref_text,
    (p.name || ' - ' || pv.name) AS item_name, 
    m.quantity_change::NUMERIC
  FROM public.product_stock_movements m 
  LEFT JOIN public.product_variants pv ON m.variant_id = pv.id 
  LEFT JOIN public.products p ON pv.product_id = p.id
  WHERE m.variant_id = p_item_id 
    AND p_item_type = 'varian'
    AND m.outlet_id = p_outlet_id
    AND m.product_id IS NULL  -- pastikan ini untuk variant, bukan produk simple
  )
),
filtered_movements AS (
  -- Filter berdasarkan tanggal dan urutkan
  SELECT * FROM movements
  WHERE created_at BETWEEN p_start_date AND p_end_date
  ORDER BY created_at ASC
)
-- Hitung saldo berjalan menggunakan Window Function
SELECT 
  fm.created_at,
  fm.movement_type,
  fm.ref_text,
  fm.item_name,
  fm.quantity_change,
  (p_initial_stock + SUM(fm.quantity_change) OVER (ORDER BY fm.created_at ROWS UNBOUNDED PRECEDING)) AS balance
FROM filtered_movements fm
ORDER BY fm.created_at ASC;
$$;

-- PERBAIKAN RPC get_current_stock berdasarkan skema sebenarnya
CREATE OR REPLACE FUNCTION public.get_current_stock(
    p_item_type TEXT,
    p_item_id UUID,
    p_outlet_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
    current_stock NUMERIC;
BEGIN
    IF p_item_type = 'produk' THEN
        -- Untuk produk simple, ambil dari product_outlets
        SELECT stock_quantity INTO current_stock
        FROM public.product_outlets
        WHERE product_id = p_item_id AND outlet_id = p_outlet_id;
        
    ELSIF p_item_type = 'varian' THEN
        -- Untuk variant, ambil dari product_variant_outlets
        SELECT stock_quantity INTO current_stock
        FROM public.product_variant_outlets
        WHERE variant_id = p_item_id AND outlet_id = p_outlet_id;
        
    ELSIF p_item_type = 'bahan baku' THEN
        -- Untuk bahan baku, ambil dari ingredient_outlets (atau ingredient_stocks)
        SELECT stock_quantity INTO current_stock
        FROM public.ingredient_outlets
        WHERE ingredient_id = p_item_id AND outlet_id = p_outlet_id;
    END IF;
    
    RETURN COALESCE(current_stock, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC BARU: Hitung stok pada tanggal tertentu (lebih akurat untuk stok awal periode)
CREATE OR REPLACE FUNCTION public.get_stock_at_date(
    p_item_type TEXT,
    p_item_id UUID,
    p_outlet_id UUID,
    p_date TIMESTAMPTZ
)
RETURNS NUMERIC AS $$
DECLARE
    current_stock NUMERIC;
    movements_after_date NUMERIC;
    stock_at_date NUMERIC;
BEGIN
    -- 1. Ambil stok saat ini
    SELECT public.get_current_stock(p_item_type, p_item_id, p_outlet_id) INTO current_stock;
    
    -- 2. Hitung total movements SETELAH tanggal yang diminta
    IF p_item_type = 'bahan baku' THEN
        SELECT COALESCE(SUM(quantity), 0) INTO movements_after_date
        FROM public.ingredient_stock_movements
        WHERE ingredient_id = p_item_id 
          AND outlet_id = p_outlet_id 
          AND created_at > p_date;
          
    ELSIF p_item_type = 'produk' THEN
        SELECT COALESCE(SUM(quantity_change), 0) INTO movements_after_date
        FROM public.product_stock_movements
        WHERE product_id = p_item_id 
          AND outlet_id = p_outlet_id 
          AND variant_id IS NULL
          AND created_at > p_date;
          
    ELSIF p_item_type = 'varian' THEN
        SELECT COALESCE(SUM(quantity_change), 0) INTO movements_after_date
        FROM public.product_stock_movements
        WHERE variant_id = p_item_id 
          AND outlet_id = p_outlet_id 
          AND product_id IS NULL
          AND created_at > p_date;
    END IF;
    
    -- 3. Stok pada tanggal = Stok saat ini - Movements setelah tanggal
    stock_at_date := current_stock - COALESCE(movements_after_date, 0);
    
    RETURN COALESCE(stock_at_date, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC BARU: Mengambil semua item yang bisa di-inventori (produk, varian, bahan baku)
-- Drop function lama jika ada
DROP FUNCTION IF EXISTS public.get_all_inventoriable_items();

CREATE OR REPLACE FUNCTION public.get_all_inventoriable_items()
RETURNS TABLE(
    id uuid,
    name text,
    type text
)
LANGUAGE sql
AS $$
-- Gabungkan semua tipe item yang bisa di-track stoknya
(SELECT id, name, 'produk' as type FROM public.products)
UNION ALL
(SELECT id, name, 'varian' as type FROM public.product_variants)
UNION ALL
(SELECT id, name, 'bahan baku' as type FROM public.ingredients)
ORDER BY type, name;
$$;
