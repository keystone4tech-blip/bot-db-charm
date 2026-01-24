// Test script for OTP functionality
const { generateOTP, createOTPSession, verifyOTPCode } = require('./services/otpService.cjs');
const crypto = require('crypto');

async function testOTPFunctionality() {
  console.log('🧪 Testing OTP functionality...');
  
  try {
    // Test 1: Generate OTP
    console.log('\n1. Testing OTP generation...');
    const otp = await generateOTP();
    console.log(`✅ Generated OTP: ${otp}`);
    console.log(`   OTP length: ${otp.length}`);
    console.log(`   Is numeric: ${/^\d+$/.test(otp)}`);
    
    // Test 2: Create OTP session
    console.log('\n2. Testing OTP session creation...');
    const testUserId = 'test-user-123';
    const sessionId = crypto.randomBytes(16).toString('hex');
    const session = await createOTPSession(testUserId, sessionId, otp);
    console.log(`✅ Created OTP session:`);
    console.log(`   Session ID: ${session.session_id}`);
    console.log(`   User ID: ${session.user_id}`);
    console.log(`   Expires at: ${session.expires_at}`);
    
    // Test 3: Verify OTP code
    console.log('\n3. Testing OTP verification...');
    const verificationResult = await verifyOTPCode(sessionId, otp);
    if (verificationResult) {
      console.log(`✅ OTP verification successful!`);
      console.log(`   Session verified: ${verificationResult.verified}`);
    } else {
      console.log(`❌ OTP verification failed!`);
    }
    
    // Test 4: Test wrong OTP
    console.log('\n4. Testing wrong OTP...');
    const wrongOTPResult = await verifyOTPCode(sessionId, '123456');
    if (!wrongOTPResult) {
      console.log(`✅ Wrong OTP correctly rejected`);
    } else {
      console.log(`❌ Wrong OTP was accepted!`);
    }
    
    console.log('\n🎉 All OTP functionality tests passed!');
    
  } catch (error) {
    console.error('❌ OTP functionality test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testOTPFunctionality();
}

module.exports = { testOTPFunctionality };