#!/usr/bin/env node

import { networkInterfaces } from 'os';

/**
 * Mobile Development Helper
 * Displays connection information for testing on mobile devices
 */

const PORT = 5173;
const BASE_PATH = '/showcase/payments/sbp/';

// Get local IP address
function getLocalIP() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (i.e., 127.0.0.1) and non-IPv4 addresses
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        results.push(net.address);
      }
    }
  }

  return results[0] || 'localhost';
}

const localIP = getLocalIP();
const url = `http://${localIP}:${PORT}${BASE_PATH}`;

console.log('\n' + '='.repeat(60));
console.log('📱  MOBILE TESTING MODE');
console.log('='.repeat(60));
console.log('\n🌐  Access URLs:');
console.log(`   Local:    http://localhost:${PORT}${BASE_PATH}`);
console.log(`   Network:  ${url}`);
console.log('\n📋  Instructions:');
console.log('   1. Make sure your phone is on the same Wi-Fi network');
console.log('   2. Open this URL on your mobile device:');
console.log(`\n      ${url}\n`);
console.log('   3. Test the mobile SBP payment flow!');
console.log('\n💡  Tips:');
console.log('   - Backend CORS is open to all origins in this mode');
console.log('   - Frontend is accessible from local network');
console.log('   - Perfect for testing mobile detection and bank app redirect');
console.log('\n' + '='.repeat(60) + '\n');
console.log('Starting servers...\n');
