const axios = require('axios');

async function testScraper() {
  console.log('--- Testing Magic Scraper ---');
  // Since we don't want to hit real external sites in a test environment, 
  // we'll try a common one or mock the axios call if needed.
  // For this test, let's just check if the service is correctly exposed.
  try {
    const response = await axios.post('http://localhost:3001/api/v1/market-intelligence/scrape', {
      url: 'https://www.apple.com/iphone-15-pro/'
    }, {
      headers: {
        'Authorization': 'Bearer ' + process.env.TEST_TOKEN
      }
    });
    console.log('✅ Scraper response:', response.data.title);
  } catch (error) {
    console.log('❌ Scraper test failed (is backend running?):', error.message);
  }
}

async function testWholesale() {
  console.log('\n--- Testing Wholesale Supplier Features ---');
  try {
    // Add product as supplier
    const addRes = await axios.post('http://localhost:3001/api/v1/wholesale/my-products', {
      title: 'Pack 100 Coques iPhone',
      wholesalePrice: 500,
      retailPriceEstimate: 15.0,
      category: 'Accessoires'
    }, {
      headers: {
        'Authorization': 'Bearer ' + process.env.TEST_TOKEN
      }
    });
    console.log('✅ Product added to supplier catalog:', addRes.id);

    // List products
    const listRes = await axios.get('http://localhost:3001/api/v1/wholesale/my-products', {
      headers: {
        'Authorization': 'Bearer ' + process.env.TEST_TOKEN
      }
    });
    console.log('✅ Supplier product count:', listRes.data.length);
  } catch (error) {
    console.log('❌ Wholesale test failed:', error.message);
  }
}

// Note: This script requires a running backend and a valid JWT.
console.log('Note: Run this with a valid TEST_TOKEN environment variable.');
// testScraper();
// testWholesale();
