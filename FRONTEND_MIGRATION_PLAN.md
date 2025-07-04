# Frontend Migration Plan: Multi-Tenant Integration

## Status Analisis Frontend

### ✅ SUDAH BAIK (Ready for Multi-Tenant)
1. **Struktur API Integration**: Sebagian besar views sudah menggunakan `fetch` ke backend via `VITE_API_BASE_URL`
2. **User Store**: Sudah ada `organization.id` dan context multi-tenant di store
3. **Authentication Flow**: Sudah terintegrasi dengan Supabase Auth
4. **Error Handling**: Sudah ada notification system via `userStore.showNotification`
5. **Loading States**: Sudah ada loading state management

### ❌ PERLU MIGRASI
1. **Authorization Headers**: Semua API call belum menyertakan JWT token
2. **Organization Context**: API call belum menyertakan `organization_id` parameter
3. **Direct Supabase Calls**: Masih ada beberapa view yang langsung call Supabase untuk data bisnis
4. **User Store Enhancement**: Perlu update untuk mengambil context dari backend
5. **Error Handling**: Perlu standardisasi error handling dari backend responses

## Rencana Migrasi Step-by-Step

### Phase 1: Core Infrastructure Enhancement (Hari 1)

#### Step 1.1: Enhanced API Service Layer
- **File**: `src/services/api.js` (baru)
- **Tujuan**: Centralized API service dengan JWT auth dan organization context
- **Features**:
  - Auto-attach JWT token dari userStore session
  - Auto-attach organization_id dari userStore
  - Centralized error handling
  - Request/response interceptors
  - Retry logic untuk token refresh

#### Step 1.2: Enhanced User Store
- **File**: `src/stores/userStore.js` (update)
- **Tujuan**: Migrasi dari direct Supabase calls ke backend API
- **Changes**:
  - `fetchUserProfile()`: Gunakan backend API untuk mengambil member, organization, features
  - `getBusinessProfile()`: Migrasi dari direct Supabase ke backend API
  - Tambah `refreshToken()` function
  - Tambah `logout()` function yang proper
  - Tambah context validation

#### Step 1.3: Router Enhancement
- **File**: `src/router/index.js` (update)
- **Tujuan**: Enhanced route guards dengan multi-tenant validation
- **Changes**:
  - Validasi organization membership
  - Role-based access control
  - Feature-based access control
  - Redirect ke onboarding jika organization belum setup

### Phase 2: Business Domain Migration (Hari 2-3)

#### Step 2.1: Products Management
- **File**: `src/views/ProdukView.vue` (update)
- **Status**: Sudah pakai backend API ✅
- **Enhance**:
  - Tambah authorization headers
  - Improve error handling
  - Add organization context validation

#### Step 2.2: Customers Management  
- **File**: `src/views/PelangganView.vue` (update)
- **Status**: Sudah pakai backend API ✅
- **Enhance**:
  - Tambah authorization headers
  - Improve error handling
  - Add organization context validation

#### Step 2.3: Sales & Transactions
- **File**: `src/views/TransaksiView.vue` (update)
- **Status**: Sudah pakai backend API ✅
- **Enhance**:
  - Tambah authorization headers
  - Improve error handling
  - Add organization context validation

#### Step 2.4: Expenses Management
- **File**: `src/views/BiayaView.vue` (update)
- **Status**: Sudah pakai backend API ✅
- **Enhance**:
  - Tambah authorization headers
  - Improve error handling
  - Add organization context validation

#### Step 2.5: Expense Categories
- **File**: `src/views/KategoriBiayaView.vue` (update)
- **Status**: Sudah pakai backend API ✅
- **Enhance**:
  - Tambah authorization headers
  - Improve error handling
  - Add organization context validation

### Phase 3: Advanced Features Migration (Hari 4)

#### Step 3.1: Dashboard Enhancement
- **File**: `src/views/DashboardView.vue` (update)
- **Status**: Partial backend API ⚠️
- **Migrate**:
  - Pindah semua dashboard metrics ke backend `/api/dashboard` endpoints
  - Remove direct Supabase calls
  - Enhanced charts dengan data dari backend

#### Step 3.2: Settings & Configuration
- **File**: `src/views/PengaturanView.vue` (major update)
- **Status**: Masih direct Supabase ❌
- **Migrate**:
  - Migrasi ke backend API `/api/organization-settings`
  - Migrasi business profile ke backend API
  - Migrasi features management ke backend API

#### Step 3.3: Reports
- **File**: `src/views/LaporanView.vue` (update)
- **Status**: Partial backend API ⚠️
- **Enhance**:
  - Tambah authorization headers
  - Enhanced reporting dengan backend aggregation
  - Export functionality via backend

### Phase 4: Authentication & Onboarding (Hari 5)

#### Step 4.1: Registration Enhancement
- **File**: `src/views/RegisterView.vue` (update)
- **Status**: Mixed Supabase + backend ⚠️
- **Migrate**:
  - Gunakan backend `/api/register/packages` endpoint
  - Enhanced error handling
  - Better validation

#### Step 4.2: Onboarding Process
- **File**: `src/views/OnboardingView.vue` (major update)
- **Status**: Direct Supabase ❌
- **Migrate**:
  - Migrasi ke backend onboarding API
  - Step-by-step validation via backend
  - Organization setup via backend

#### Step 4.3: Employee Management
- **File**: `src/views/PegawaiView.vue` (analyze & migrate)
- **Status**: Unknown, perlu analisis ❓
- **Plan**: Migrasi ke backend employee management API

### Phase 5: Testing & Validation (Hari 6)

#### Step 5.1: End-to-End Testing
- Test flow lengkap: Register → Onboarding → CRUD operations
- Validasi data isolation antar tenant
- Test error scenarios dan edge cases

#### Step 5.2: Performance Optimization
- Optimize API calls (batch operations where possible)
- Implement proper caching strategy
- Optimize loading states

#### Step 5.3: Security Validation
- Validasi semua requests menggunakan proper JWT
- Validasi organization_id di semua operations
- Test unauthorized access scenarios

## Implementation Guidelines

### API Service Pattern
```javascript
// Contoh pattern yang akan digunakan
class ApiService {
  async get(endpoint, params = {}) {
    const token = userStore.session?.access_token;
    const orgId = userStore.organization?.id;
    
    const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/api${endpoint}`);
    if (orgId) url.searchParams.set('organization_id', orgId);
    Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse(response);
  }
}
```

### Error Handling Pattern
```javascript
// Standardized error handling
const handleApiError = (error, userStore) => {
  if (error.status === 401) {
    userStore.clearUserProfile();
    router.push('/login');
  } else if (error.status === 403) {
    userStore.showNotification('Akses tidak diizinkan', 'error');
  } else {
    userStore.showNotification(error.message || 'Terjadi kesalahan', 'error');
  }
};
```

### Loading State Pattern
```javascript
// Consistent loading pattern
const withLoading = async (operation, loadingRef) => {
  loadingRef.value = true;
  try {
    return await operation();
  } finally {
    loadingRef.value = false;
  }
};
```

## Success Criteria

### Functional Requirements
- [ ] Semua CRUD operations menggunakan backend API
- [ ] Semua requests menyertakan proper JWT authorization
- [ ] Data terisolasi per organization (tenant)
- [ ] Error handling konsisten di seluruh aplikasi
- [ ] Loading states yang smooth dan informatif

### Security Requirements
- [ ] Tidak ada direct Supabase calls untuk business data
- [ ] Semua sensitive operations require authentication
- [ ] Organization context validated di setiap request
- [ ] Proper session management dan logout

### Performance Requirements
- [ ] Initial load time < 3 seconds
- [ ] API response time < 500ms untuk CRUD operations
- [ ] Proper error recovery dan retry mechanisms
- [ ] Efficient data fetching (no over-fetching)

### User Experience Requirements
- [ ] Seamless transition dari dummy data ke real backend
- [ ] Clear error messages dan recovery suggestions
- [ ] Consistent UI/UX across all migrated features
- [ ] Proper onboarding flow untuk new organizations

## Risk Mitigation

### Technical Risks
1. **API Integration Issues**: Mitigasi dengan thorough testing dan fallback mechanisms
2. **Authentication Failures**: Implement robust token refresh dan error recovery
3. **Data Migration**: Ensure backward compatibility during transition

### Business Risks
1. **User Experience Disruption**: Migrate incrementally, maintain feature parity
2. **Data Loss**: Implement proper backup dan rollback strategies
3. **Performance Degradation**: Monitor performance metrics throughout migration

## Timeline Summary

- **Day 1**: Core infrastructure (API service, enhanced user store, router)
- **Day 2-3**: Business domain migration (products, customers, sales, expenses)
- **Day 4**: Advanced features (dashboard, settings, reports)
- **Day 5**: Authentication & onboarding
- **Day 6**: Testing & validation

Total estimated time: **6 working days** dengan dedicated focus.

## Implementation Status

### ✅ COMPLETED - Phase 1: Core Infrastructure Enhancement (Hari 1)

#### Step 1.1: Enhanced API Service Layer ✅
- **File**: `src/services/api.js` (created)
- **Features Implemented**:
  - Centralized API service dengan JWT auth dan organization context
  - Auto-attach JWT token dari userStore session
  - Auto-attach organization_id dari userStore
  - Centralized error handling dengan status-specific messages
  - Request/response interceptors
  - Specific API methods untuk semua resource domains
  - File upload support
  - Health check integration

#### Step 1.2: Enhanced User Store ✅
- **File**: `src/stores/userStore.js` (updated)
- **Changes Implemented**:
  - Added API service integration
  - Enhanced `fetchUserProfile()` dengan backend API integration
  - Added new getters: `organizationId`, `hasValidMembership`
  - Added new actions: `logout()`, `refreshUserData()`, `validateMembership()`
  - Added utility functions: `hasFeature()`, `hasRole()`
  - Improved error handling dan user feedback

#### Step 1.3: Enhanced Router Guards ✅
- **File**: `src/router/index.js` (updated)
- **Enhancements Implemented**:
  - Enhanced multi-tenant validation dengan organization membership check
  - Enhanced role-based access control dengan hierarchical roles
  - Enhanced feature-based access control
  - Improved organization status validation (pending, suspended, deleted)
  - Better redirect handling dengan intended destination
  - Health check integration untuk protected routes
  - Comprehensive logging untuk debugging

#### Step 1.4: Enhanced Composable for API Operations ✅
- **File**: `src/composables/useApi.js` (created)
- **Features Implemented**:
  - Generic `useApiCrud()` composable untuk standardized CRUD operations
  - Specialized composables: `useProducts()`, `useCustomers()`, `useSales()`, etc.
  - Built-in loading states, error handling, search functionality
  - Form helpers untuk create/edit operations
  - Pagination helpers untuk future scalability
  - Consistent pattern untuk semua resource domains

### ✅ TESTING RESULTS - Phase 1
- **Frontend Build**: ✅ Success (no errors)
- **Backend Health**: ✅ API running on port 3000
- **API Integration**: ✅ Service layer properly configured
- **User Store**: ✅ Enhanced methods available
- **Router Guards**: ✅ Enhanced validation active

## Next Steps

1. **Immediate**: Mulai dengan Phase 1 - Core Infrastructure Enhancement
2. **Create API Service**: Implement centralized API service layer
3. **Update User Store**: Migrate ke backend API calls
4. **Test Infrastructure**: Validate core infrastructure sebelum lanjut ke business domains

Apakah Anda ingin saya mulai implementasi dari Phase 1?
