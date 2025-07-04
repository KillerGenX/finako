# Setup Sample Data - Step by Step Guide

## Prerequisites
Pastikan backend sudah berjalan dan semua tabel sudah ter-migrate dengan benar.

## Step 1: Create Users in Supabase Auth Dashboard

Buka Supabase Dashboard → Authentication → Users → Add user

Buat 4 users berikut:

1. **Email:** `tuan.a@alpha.com` | **Password:** `password123` (Owner Alpha Corp)
2. **Email:** `staff.a@alpha.com` | **Password:** `password123` (Staff Alpha Corp)  
3. **Email:** `tuan.b@beta.com` | **Password:** `password123` (Owner Beta Ltd)
4. **Email:** `tuan.c@gamma.com` | **Password:** `password123` (Owner Gamma Inc)

## Step 2: Get User IDs

Jalankan query ini di Supabase SQL Editor untuk mendapatkan user IDs:

```sql
SELECT id, email FROM auth.users 
WHERE email IN (
    'tuan.a@alpha.com',
    'staff.a@alpha.com', 
    'tuan.b@beta.com',
    'tuan.c@gamma.com'
)
ORDER BY email;
```

## ⚠️ Important Notes

### Database Schema Issue Fixed:
- **Issue**: Kolom `price` tidak ada di tabel `products`
- **Fix**: Menggunakan `selling_price` sebagai kolom yang benar
- **Files Updated**: 
  - `setup-sample-data.sql` 
  - `final-sample-data-setup.sql`

### User ID Mapping (✅ Updated):
- **tuan.a@alpha.com**: `a9a93a2a-8779-4723-8ab8-5d72699e5c79` (Owner Alpha Corp)
- **staff.a@alpha.com**: `fd805424-f104-411c-9346-5b8e271e7d0f` (Staff Alpha Corp)
- **tuan.b@beta.com**: `41e15dff-920f-4007-821c-83c4cae97bbc` (Owner Beta Ltd)
- **tuan.c@gamma.com**: `145243d0-d89f-4d24-a7d9-5f2bff9468f3` (Owner Gamma Inc)
```
id                                   | email
-------------------------------------|-------------------
fd805424-f104-411c-9346-5b8e271e7d0f | staff.a@alpha.com
a9a93a2a-8779-4723-8ab8-5d72699e5c79 | tuan.a@alpha.com  
41e15dff-920f-4007-821c-83c4cae97bbc | tuan.b@beta.com
145243d0-d89f-4d24-a7d9-5f2bff9468f3 | tuan.c@gamma.com
```

## Step 3: ✅ Update setup-sample-data.sql (COMPLETED)

~~Edit file `setup-sample-data.sql` dan ganti placeholder berikut dengan user ID yang sebenarnya:~~

✅ **SUDAH SELESAI** - File `setup-sample-data.sql` sudah diupdate dengan user ID yang sebenarnya:
- `tuan.a@alpha.com`: `a9a93a2a-8779-4723-8ab8-5d72699e5c79` (Owner Alpha Corp)
- `staff.a@alpha.com`: `fd805424-f104-411c-9346-5b8e271e7d0f` (Staff Alpha Corp)
- `tuan.b@beta.com`: `41e15dff-920f-4007-821c-83c4cae97bbc` (Owner Beta Ltd)
- `tuan.c@gamma.com`: `145243d0-d89f-4d24-a7d9-5f2bff9468f3` (Owner Gamma Inc)

## Step 4: Run Sample Data SQL

Copy seluruh isi `setup-sample-data.sql` yang sudah diupdate dan jalankan di Supabase SQL Editor.

## Step 5: ✅ Add Users to Organizations (READY TO RUN)

Setelah step 4 berhasil, jalankan query ini (sudah dengan user ID yang sebenarnya):

```sql
INSERT INTO organization_members (user_id, organization_id, role) VALUES 
('a9a93a2a-8779-4723-8ab8-5d72699e5c79', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
('fd805424-f104-411c-9346-5b8e271e7d0f', '550e8400-e29b-41d4-a716-446655440001', 'staff'),
('41e15dff-920f-4007-821c-83c4cae97bbc', '550e8400-e29b-41d4-a716-446655440002', 'owner'),
('145243d0-d89f-4d24-a7d9-5f2bff9468f3', '550e8400-e29b-41d4-a716-446655440003', 'owner');
```

## Step 6: Verify Setup

Jalankan query verification untuk memastikan data tersimpan dengan benar:

```sql
-- Check organizations
SELECT id, name, email, owner_id FROM organizations;

-- Check organization members
SELECT om.user_id, om.organization_id, om.role, o.name as org_name, u.email
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id  
JOIN auth.users u ON om.user_id = u.id;

-- Check data separation
SELECT 'Alpha Corp Products' as label, COUNT(*) as count FROM products WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 'Beta Ltd Products' as label, COUNT(*) as count FROM products WHERE organization_id = '550e8400-e29b-41d4-a716-446655440002'
UNION ALL  
SELECT 'Gamma Inc Products' as label, COUNT(*) as count FROM products WHERE organization_id = '550e8400-e29b-41d4-a716-446655440003';
```

## Step 7: Get JWT Tokens for Testing

Gunakan script `get-jwt-tokens.sh` untuk mendapatkan JWT tokens untuk semua users, atau login manual via Supabase client.

## Step 8: Update Postman Environment

Update environment variables di Postman dengan JWT tokens yang didapat dari step 7.

## Step 9: Run Postman Tests

Jalankan collection `Finako_Backend_Testing.postman_collection.json` untuk memverifikasi semua endpoint bekerja dengan benar.

---

## Troubleshooting

### Error: null value in column "owner_id" 
- Pastikan user sudah dibuat di Supabase Auth terlebih dahulu
- Pastikan placeholder `[REPLACE_WITH_*_USER_ID]` sudah diganti dengan user ID yang sebenarnya

### Error: invalid input syntax for type uuid
- Pastikan menggunakan UUID format yang valid
- Jangan gunakan string custom seperti 'org-alpha-123'

### Error: duplicate key value violates unique constraint
- Jalankan `DELETE FROM organizations WHERE id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003');` untuk menghapus data lama
- Lalu jalankan kembali setup-sample-data.sql
