# Tabel & Field Lengkap Finako SaaS POS

Berikut adalah daftar tabel utama beserta field lengkap dan relasi antar tabel (berdasarkan skema multi-tenant Finako, hasil sinkronisasi dengan definisi CREATE TABLE terbaru):

---

## organizations
| Field                  | Tipe      | Keterangan                        |
|------------------------|-----------|-----------------------------------|
| id                     | uuid      | Primary key                       |
| created_at             | timestamp | Waktu pembuatan                   |
| name                   | text      | Nama organisasi                   |
| owner_id               | uuid      | FK → auth.users                   |
| package_id             | text      | FK → packages                     |
| status                 | varchar   | Status: 'pending'/'active'/'rejected'/'suspended' |
| logo_url               | text      |                                   |
| address                | text      |                                   |
| qris_image_url         | text      |                                   |
| theme_color            | text      |                                   |
| phone                  | text      |                                   |
| email                  | text      |                                   |
| bank_name              | text      |                                   |
| bank_account_number    | text      |                                   |
| bank_account_holder    | text      |                                   |
| receipt_footer_text    | text      |                                   |

## profiles
| Field         | Tipe      | Keterangan                        |
|--------------|-----------|-----------------------------------|
| id           | uuid      | PK, FK → auth.users               |
| full_name    | text      | Nama lengkap                      |
| email        | text      | Email user                        |
| created_at   | timestamp | Waktu pembuatan                   |

## organization_members
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| organization_id| uuid      | PK, FK → organizations            |
| user_id        | uuid      | PK, FK → profiles                 |
| role           | text      | 'owner'/'pegawai'                 |
| created_at     | timestamp | Waktu pembuatan                   |

## products
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | uuid      | PK                                 |
| created_at     | timestamp |                                    |
| updated_at     | timestamp |                                    |
| user_id        | uuid      | FK → auth.users                    |
| organization_id| uuid      | FK → organizations                 |
| name           | text      |                                    |
| sku            | text      |                                    |
| category_id    | uuid      | FK → product_categories            |
| unit           | text      |                                    |
| purchase_price | numeric   |                                    |
| selling_price  | numeric   |                                    |
| min_stock      | integer   |                                    |
| foto_url       | text      |                                    |
| description    | text      |                                    |
| is_active      | boolean   |                                    |
## product_categories
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | uuid      | PK                                 |
| organization_id| uuid      | FK → organizations                 |
| name           | text      |                                    |
| created_at     | timestamp |                                    |

## customers
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | bigint    | PK                                 |
| organization_id| uuid      | FK → organizations                 |
| name           | text      |                                    |
| phone_number   | text      |                                    |
| points         | integer   |                                    |
| created_at     | timestamp |                                    |

## sales
| Field                   | Tipe      | Keterangan                        |
|-------------------------|-----------|-----------------------------------|
| id                      | bigint    | PK                                 |
| created_at              | timestamp |                                    |
| customer_phone          | text      |                                    |
| total                   | numeric   |                                    |
| items                   | jsonb     |                                    |
| organization_id         | uuid      | FK → organizations                 |
| user_id                 | uuid      | FK → auth.users                    |
| customer_id             | bigint    | FK → customers                     |
| receipt_url             | text      |                                    |
| customer_name           | text      |                                    |
| discount_type           | text      |                                    |
| discount_value          | numeric   |                                    |
| tax_amount              | numeric   |                                    |
| service_charge_amount   | numeric   |                                    |
| status                  | text      | default 'completed'                |
## sale_payments
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | bigint    | PK                                 |
| sale_id        | bigint    | FK → sales                         |
| method         | text      |                                    |
| amount         | numeric   |                                    |
| created_at     | timestamp |                                    |

## expenses
| Field               | Tipe      | Keterangan                        |
|---------------------|-----------|-----------------------------------|
| id                  | uuid      | PK                                 |
| organization_id     | uuid      | FK → organizations                 |
| user_id             | uuid      | FK → auth.users                    |
| expense_category_id | uuid      | FK → expense_categories            |
| amount              | numeric   |                                    |
| description         | text      |                                    |
| created_at          | timestamp |                                    |
## expense_categories
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | uuid      | PK                                 |
| organization_id| uuid      | FK → organizations                 |
| user_id        | uuid      | FK → auth.users                    |
| name           | text      |                                    |
| created_at     | timestamp |                                    |

## categories
| Field           | Tipe     | Keterangan                |
|----------------|----------|---------------------------|
| id             | uuid     | Primary key               |
| organization_id| uuid     | FK ke organizations       |
| user_id        | uuid     | FK ke auth.users          |
| name           | text     | Nama kategori             |
| created_at     | timestamp | Waktu pembuatan          |

## outlets
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | uuid      | PK                                 |
| organization_id| uuid      | FK → organizations                 |
| name           | text      |                                    |
| address        | text      |                                    |
| created_at     | timestamp |                                    |
## stocks
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | uuid      | PK                                 |
| product_id     | uuid      | FK → products                      |
| organization_id| uuid      | FK → organizations                 |
| outlet_id      | uuid      | FK → outlets                       |
| stock          | integer   |                                    |
| updated_at     | timestamp |                                    |
## stock_movements
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | uuid      | PK                                 |
| product_id     | uuid      | FK → products                      |
| organization_id| uuid      | FK → organizations                 |
| outlet_id      | uuid      | FK → outlets                       |
| user_id        | uuid      | FK → auth.users                    |
| type           | text      |                                    |
| quantity       | integer   |                                    |
| before_stock   | integer   |                                    |
| after_stock    | integer   |                                    |
| note           | text      |                                    |
| created_at     | timestamp |                                    |
## attendances
| Field               | Tipe      | Keterangan                        |
|---------------------|-----------|-----------------------------------|
| id                  | bigint    | PK                                 |
| organization_id     | uuid      | FK → organizations                 |
| user_id             | uuid      | FK → profiles                      |
| check_in_time       | timestamp |                                    |
| check_out_time      | timestamp |                                    |
| check_in_photo_url  | text      |                                    |
| check_out_photo_url | text      |                                    |
| check_in_location   | jsonb     |                                    |
| check_out_location  | jsonb     |                                    |
## business_profiles
| Field                   | Tipe      | Keterangan                        |
|-------------------------|-----------|-----------------------------------|
| id                      | bigint    | PK                                 |
| created_at              | timestamp |                                    |
| organization_id         | uuid      | FK → organizations, unique         |
| fixed_costs             | numeric   |                                    |
| avg_variable_cost       | numeric   |                                    |
| avg_selling_price       | numeric   |                                    |
| tax_enabled             | boolean   |                                    |
| tax_percent             | numeric   |                                    |
| service_charge_enabled  | boolean   |                                    |
| service_charge_percent  | numeric   |                                    |
## audit_logs
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | bigint    | PK                                 |
| user_id        | uuid      | FK → auth.users                    |
| action         | text      |                                    |
| details        | jsonb     |                                    |
| created_at     | timestamp |                                    |
## invoices
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | bigint    | PK                                 |
| organization_id| uuid      | FK → organizations                 |
| package_id     | text      | FK → packages                      |
| amount         | numeric   |                                    |
| status         | text      | default 'pending'                  |
| due_date       | date      |                                    |
| paid_at        | timestamp |                                    |
| created_at     | timestamp |                                    |
## packages
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | text      | PK                                 |
| name           | text      |                                    |
| price          | numeric   |                                    |
| user_limit     | integer   |                                    |
| features       | jsonb     |                                    |
## features
| Field           | Tipe      | Keterangan                        |
|----------------|-----------|-----------------------------------|
| id             | text      | PK                                 |
| name           | text      |                                    |
| description    | text      |                                    |

## transactions
| Field           | Tipe     | Keterangan                |
|----------------|----------|---------------------------|
| id             | bigint   | Primary key               |
| created_at     | timestamp | Waktu pembuatan          |
| user_id        | uuid     | FK ke auth.users          |
| organization_id| uuid     | FK ke organizations       |
| description    | text     | Keterangan                |
| amount         | numeric  | Nominal                   |
| type           | text     | Jenis transaksi           |
| category       | text     | Kategori                  |
| expense_category_id | bigint | FK ke expense_categories |
| sale_id        | bigint   | FK ke sales               |

---

## Relasi Antar Tabel (Diagram Teks)

organizations ← organization_members → profiles
organizations → products, customers, outlets, product_categories, expense_categories, expenses, sales, business_profiles, invoices, stocks, stock_movements, attendances, organization_features
products → product_categories, stocks, stock_movements
sales → sale_payments, transactions
expenses → expense_categories, transactions
packages → package_features, invoices
features → package_features, organization_features
auth.users → profiles, organization_members, products, sales, expenses, audit_logs, stock_movements, transactions

---

Jika ingin ERD visual atau penjelasan field lebih detail, silakan request!
