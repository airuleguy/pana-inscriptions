#!/usr/bin/env node

/**
 * Test script to demonstrate Phase 3: Country Authorization functionality
 * 
 * This script tests:
 * 1. User authentication works correctly
 * 2. Country-scoped access is enforced
 * 3. Cross-country access is prevented
 * 4. Data is automatically filtered by user's country
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

// Test users for different countries (should be seeded)
const testUsers = {
  usa: { username: 'usa_delegate', password: 'password123' },
  can: { username: 'can_delegate', password: 'password123' },
  mex: { username: 'mex_delegate', password: 'password123' }
};

let userTokens = {};

async function authenticate(country) {
  try {
    console.log(`\n🔐 Authenticating ${country.toUpperCase()} user...`);
    const response = await axios.post(`${API_BASE}/auth/login`, testUsers[country]);
    
    if (response.data.success) {
      userTokens[country] = response.data.token;
      console.log(`✅ ${country.toUpperCase()} user authenticated successfully`);
      return true;
    } else {
      console.log(`❌ ${country.toUpperCase()} authentication failed:`, response.data.message);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${country.toUpperCase()} authentication error:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testEndpointAccess(country, endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${userTokens[country]}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || error.message,
      status: error.response?.status 
    };
  }
}

async function testCountryAuthorization() {
  console.log('\n🧪 Testing Country Authorization (Phase 3)');
  console.log('===============================================');

  // Authenticate all test users
  const authResults = await Promise.all([
    authenticate('usa'),
    authenticate('can'),
    authenticate('mex')
  ]);

  if (!authResults.every(Boolean)) {
    console.log('❌ Some users failed to authenticate. Ensure test users are seeded.');
    return;
  }

  console.log('\n📊 Testing Country-Scoped Data Access');
  console.log('------------------------------------');

  // Test 1: Each user can only see their country's data
  console.log('\n1. Testing choreographies endpoint access:');
  
  for (const country of ['usa', 'can', 'mex']) {
    const result = await testEndpointAccess(country, '/choreographies');
    if (result.success) {
      const choreographies = result.data;
      const nonCountryData = choreographies.filter(choreo => choreo.country !== country.toUpperCase());
      
      if (nonCountryData.length === 0) {
        console.log(`   ✅ ${country.toUpperCase()}: Only sees own country data (${choreographies.length} items)`);
      } else {
        console.log(`   ❌ ${country.toUpperCase()}: Sees cross-country data! Found ${nonCountryData.length} items from other countries`);
      }
    } else {
      console.log(`   ❌ ${country.toUpperCase()}: Access denied - ${result.message}`);
    }
  }

  // Test 2: Global registrations are country-scoped
  console.log('\n2. Testing global registrations access:');
  
  for (const country of ['usa', 'can']) {
    const result = await testEndpointAccess(country, '/registrations/summary');
    if (result.success) {
      console.log(`   ✅ ${country.toUpperCase()}: Can access registration summary`);
    } else {
      console.log(`   ❌ ${country.toUpperCase()}: Cannot access registration summary - ${result.message}`);
    }
  }

  // Test 3: Tournament registrations are country-scoped
  console.log('\n3. Testing tournament registrations access:');
  
  // Get tournaments first (if available)
  const tournamentResult = await testEndpointAccess('usa', '/tournaments');
  if (tournamentResult.success && tournamentResult.data.length > 0) {
    const tournamentId = tournamentResult.data[0].id;
    
    for (const country of ['usa', 'can']) {
      const result = await testEndpointAccess(country, `/tournaments/${tournamentId}/registrations/judges`);
      if (result.success) {
        const judges = result.data;
        const nonCountryJudges = judges.filter(judge => judge.country !== country.toUpperCase());
        
        if (nonCountryJudges.length === 0) {
          console.log(`   ✅ ${country.toUpperCase()}: Only sees own country judges (${judges.length} items)`);
        } else {
          console.log(`   ❌ ${country.toUpperCase()}: Sees cross-country judges! Found ${nonCountryJudges.length} items from other countries`);
        }
      } else {
        console.log(`   ❌ ${country.toUpperCase()}: Cannot access tournament judges - ${result.message}`);
      }
    }
  } else {
    console.log('   ⚠️  No tournaments available for testing');
  }

  // Test 4: Cross-country data creation prevention
  console.log('\n4. Testing cross-country data creation prevention:');
  
  // Try to create choreography with wrong country
  const wrongCountryChoreography = {
    name: 'Test Choreography',
    country: 'FRA', // Wrong country - should be overridden to USA
    category: 'SENIOR',
    type: 'MIND',
    gymnastCount: 1,
    oldestGymnastAge: 25,
    notes: 'Test choreography for country auth',
    gymnasts: []
  };

  // Get tournaments first for choreography creation
  if (tournamentResult.success && tournamentResult.data.length > 0) {
    wrongCountryChoreography.tournamentId = tournamentResult.data[0].id;
    
    const createResult = await testEndpointAccess('usa', '/choreographies', 'POST', wrongCountryChoreography);
    if (createResult.success) {
      const createdChoreography = createResult.data;
      if (createdChoreography.country === 'USA') {
        console.log('   ✅ USA: Country was automatically corrected to USA (from FRA)');
      } else {
        console.log(`   ❌ USA: Country was not corrected! Got: ${createdChoreography.country}`);
      }
    } else {
      console.log(`   ❌ USA: Failed to create choreography - ${createResult.message}`);
    }
  }

  // Test 5: Unauthenticated access prevention
  console.log('\n5. Testing unauthenticated access prevention:');
  
  try {
    const response = await axios.get(`${API_BASE}/choreographies`);
    console.log('   ❌ Unauthenticated access allowed! This should not happen.');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ✅ Unauthenticated access properly denied (401)');
    } else {
      console.log(`   ⚠️  Unexpected error: ${error.response?.status} - ${error.message}`);
    }
  }

  console.log('\n🎉 Country Authorization Testing Complete!');
  console.log('==========================================');
}

// Run the tests
testCountryAuthorization().catch(console.error); 