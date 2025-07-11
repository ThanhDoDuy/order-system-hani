// Simple test script to verify API connection
// Run with: node test-api.js

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testAPI() {
  console.log('🧪 Testing CMS Order API Connection...\n');

  try {
    // Test products endpoint
    console.log('📦 Testing Products API...');
    const productsResponse = await fetch(`${API_BASE_URL}/cms/products`);
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log(`✅ Products API working - Found ${products.length} products`);
    } else {
      console.log(`❌ Products API failed - Status: ${productsResponse.status}`);
    }

    // Test orders endpoint
    console.log('\n📋 Testing Orders API...');
    const ordersResponse = await fetch(`${API_BASE_URL}/cms/orders`);
    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      console.log(`✅ Orders API working - Found ${orders.length} orders`);
    } else {
      console.log(`❌ Orders API failed - Status: ${ordersResponse.status}`);
    }

    // Test reports endpoint
    console.log('\n📊 Testing Reports API...');
    const reportsResponse = await fetch(`${API_BASE_URL}/cms/reports/stats`);
    if (reportsResponse.ok) {
      const stats = await reportsResponse.json();
      console.log(`✅ Reports API working - Stats:`, stats);
    } else {
      console.log(`❌ Reports API failed - Status: ${reportsResponse.status}`);
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Make sure the backend is running on http://localhost:8000');
  }
}

testAPI(); 