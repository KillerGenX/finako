#!/bin/bash

# JWT Token Generator for Testing
# This script helps you get JWT tokens for Tuan A and Tuan B

echo "🔐 Finako Backend JWT Token Generator for Testing"
echo "=================================================="

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is running on port 3000"
else
    echo "❌ Backend is not running. Please start it first:"
    echo "   cd finako-backend && npm start"
    exit 1
fi

echo ""
echo "📋 Instructions to get JWT tokens:"
echo ""

echo "1️⃣  Setup Organizations and Users in Supabase:"
echo "   - Run the setup-sample-data.sql in Supabase SQL Editor"
echo "   - Create user accounts for Tuan A and Tuan B in Supabase Auth"
echo "   - Make sure they are members of their respective organizations"
echo ""

echo "2️⃣  Manual Steps to Get JWT Tokens:"
echo ""
echo "   For Tuan A (Alpha Corp):"
echo "   ------------------------"
echo "   - Login to your frontend as Tuan A"
echo "   - Open browser DevTools → Application → LocalStorage"
echo "   - Look for Supabase session data"
echo "   - Copy the 'access_token' value"
echo ""
echo "   For Tuan B (Beta Ltd):"
echo "   ----------------------"
echo "   - Login to your frontend as Tuan B"
echo "   - Open browser DevTools → Application → LocalStorage"
echo "   - Look for Supabase session data"
echo "   - Copy the 'access_token' value"
echo ""

echo "3️⃣  Alternative: Get tokens from Supabase directly:"
echo ""
echo "   Using Supabase CLI:"
echo "   supabase auth login --email tuan.a@alpha.com --password password123"
echo "   supabase auth login --email tuan.b@beta.com --password password123"
echo ""

echo "4️⃣  Update Postman Environment Variables:"
echo ""
echo "   - Open the Postman collection: Finako_Backend_Testing.postman_collection.json"
echo "   - Update these variables:"
echo "     * tuan_a_token: [PASTE_TUAN_A_JWT_TOKEN_HERE]"
echo "     * tuan_b_token: [PASTE_TUAN_B_JWT_TOKEN_HERE]"
echo "     * alpha_org_id: org-alpha-123"
echo "     * beta_org_id: org-beta-456"
echo ""

echo "5️⃣  Sample JWT Token Format:"
echo ""
echo "   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzIwMTg..."
echo ""

echo "🧪 Ready to test! Run these collections in order:"
echo ""
echo "   1. 🔐 Authentication Tests"
echo "   2. 📦 Products - Data Isolation Tests"  
echo "   3. 👥 Customers - Data Isolation Tests"
echo "   4. 💰 Sales - Transaction Tests"
echo "   5. 💸 Expenses - Data Isolation Tests"
echo "   6. 📊 Dashboard - Data Aggregation Tests"
echo "   7. ❌ Error Handling Tests"
echo "   8. 🚀 Performance Tests"
echo ""

echo "🎯 Success Criteria:"
echo "   ✅ Tuan A can only see Alpha Corp data"
echo "   ✅ Tuan B can only see Beta Ltd data"
echo "   ✅ No cross-tenant data leakage"
echo "   ✅ All CRUD operations work correctly"
echo "   ✅ Error handling is consistent"
echo "   ✅ Performance is acceptable (<500ms)"
echo ""

echo "💡 Troubleshooting:"
echo "   - If 401 errors: Check JWT token validity"
echo "   - If 403 errors: Check organization membership"
echo "   - If empty results: Check organization_id filtering"
echo "   - If wrong data: Check RLS policies in Supabase"
echo ""

# Test basic connectivity
echo "🔧 Testing basic connectivity..."
echo ""

echo "Testing health endpoint:"
curl -s http://localhost:3000/health | jq '.' 2>/dev/null || curl -s http://localhost:3000/health

echo ""
echo "Testing API root:"
curl -s http://localhost:3000/ | jq '.' 2>/dev/null || curl -s http://localhost:3000/

echo ""
echo "🚀 Ready to start testing! Good luck! 🍀"
