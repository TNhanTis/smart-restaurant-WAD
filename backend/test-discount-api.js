const axios = require('axios');

const API_URL = 'http://localhost:3000';
let authToken = '';
let billRequestId = '';

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'waiter1@example.com',
      password: 'password123'
    });
    authToken = response.data.access_token;
    console.log('✅ Login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function getBillRequests() {
  try {
    const response = await axios.get(`${API_URL}/bill-requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Bill requests:', response.data.length);
    if (response.data.length > 0) {
      billRequestId = response.data[0].id;
      console.log('   Using bill request:', billRequestId);
      console.log('   Total amount:', response.data[0].total_amount);
    }
    return response.data;
  } catch (error) {
    console.error('❌ Get bill requests failed:', error.response?.data || error.message);
    throw error;
  }
}

async function applyDiscount(billRequestId, discountData) {
  try {
    const response = await axios.post(
      `${API_URL}/bill-requests/${billRequestId}/apply-discount`,
      discountData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Discount applied successfully');
    console.log('   Subtotal:', response.data.subtotal);
    console.log('   Discount:', `-${response.data.discount_amount}`);
    console.log('   Tax:', response.data.tax_amount);
    console.log('   Final Amount:', response.data.final_amount);
    return response.data;
  } catch (error) {
    console.error('❌ Apply discount failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testDiscountFlow() {
  console.log('🧪 Testing Discount API...\n');

  // Test 1: Login as waiter
  console.log('1️⃣ Testing login...');
  await login();
  console.log('');

  // Test 2: Get bill requests
  console.log('2️⃣ Getting bill requests...');
  const bills = await getBillRequests();
  if (bills.length === 0) {
    console.log('⚠️  No bill requests found. Create one first!');
    return;
  }
  console.log('');

  // Test 3: Apply 10% discount
  console.log('3️⃣ Applying 10% discount...');
  await applyDiscount(billRequestId, {
    discount_type: 'percentage',
    discount_value: 10,
    tax_rate: 8
  });
  console.log('');

  // Test 4: Apply fixed discount
  console.log('4️⃣ Applying 50000 VND fixed discount...');
  await applyDiscount(billRequestId, {
    discount_type: 'fixed',
    discount_value: 50000,
    tax_rate: 8
  });
  console.log('');

  // Test 5: Remove discount
  console.log('5️⃣ Removing discount...');
  await applyDiscount(billRequestId, {
    discount_type: 'none',
    discount_value: 0,
    tax_rate: 8
  });
  console.log('');

  console.log('✅ All tests completed!');
}

testDiscountFlow().catch(console.error);
