# UUID Mapping untuk Testing Multi-Tenant

## Organization IDs (Valid UUIDs)

```
Alpha Corp:  550e8400-e29b-41d4-a716-446655440001
Beta Ltd:    550e8400-e29b-41d4-a716-446655440002  
Gamma Inc:   550e8400-e29b-41d4-a716-446655440003
```

## Setup Requirements

⚠️ **PENTING**: Kolom `owner_id` di tabel `organizations` adalah NOT NULL constraint.

### Setup Sequence:
1. ✅ UUID telah diperbaiki di semua file
2. 🔄 **Buat users di Supabase Auth Dashboard terlebih dahulu**
3. 🔄 **Dapatkan user IDs dari auth.users table**
4. 🔄 **Update placeholder di setup-sample-data.sql dengan user ID sebenarnya**
5. ⏳ Jalankan `setup-sample-data.sql` di Supabase SQL Editor
6. ⏳ Assign user ke organization_members
7. ⏳ Dapatkan JWT tokens dan update Postman environment
8. ⏳ Jalankan Postman collection testing

## User Mapping untuk Testing

Buat user berikut di Supabase Auth Dashboard:

1. **tuan.a@alpha.com** → Owner di Alpha Corp (perlu user ID-nya untuk owner_id)
2. **staff.a@alpha.com** → Staff di Alpha Corp
3. **tuan.b@beta.com** → Owner di Beta Ltd (perlu user ID-nya untuk owner_id)
4. **tuan.c@gamma.com** → Owner di Gamma Inc (perlu user ID-nya untuk owner_id)

## Placeholders to Replace

Dalam `setup-sample-data.sql`, ganti:
- `[REPLACE_WITH_TUAN_A_USER_ID]` → User ID tuan.a@alpha.com
- `[REPLACE_WITH_TUAN_B_USER_ID]` → User ID tuan.b@beta.com  
- `[REPLACE_WITH_TUAN_C_USER_ID]` → User ID tuan.c@gamma.com
