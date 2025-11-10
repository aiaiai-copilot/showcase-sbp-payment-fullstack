#!/usr/bin/env node

import { networkInterfaces } from 'os';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Mobile Development Helper
 * Displays connection information for testing on mobile devices
 */

const FRONTEND_PORT = 5173;
const BACKEND_PORT = 3000;
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
const frontendUrl = `http://${localIP}:${FRONTEND_PORT}${BASE_PATH}`;
const backendUrl = `http://${localIP}:${BACKEND_PORT}`;

// Create .env.mobile for frontend with backend URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const frontendEnvPath = join(projectRoot, 'frontend', '.env.mobile');

const envContent = `# Auto-generated for mobile testing - DO NOT COMMIT
VITE_API_URL=${backendUrl}
`;

writeFileSync(frontendEnvPath, envContent);

console.log('\n' + '='.repeat(60));
console.log('📱  MOBILE TESTING MODE');
console.log('='.repeat(60));
console.log('\n🌐  Network Information:');
console.log(`   Your IP:  ${localIP}`);
console.log(`   Backend:  ${backendUrl}`);
console.log(`   Frontend: ${frontendUrl}`);
console.log('\n📋  Open on your mobile device:');
console.log(`\n   👉  ${frontendUrl}\n`);
console.log('📝  Instructions:');
console.log('   1. Make sure your phone is on the same Wi-Fi network');
console.log('   2. Copy the URL above to your mobile browser');
console.log('   3. Test the mobile SBP payment flow!');
console.log('\n💡  Configuration:');
console.log('   ✓ Backend CORS: Open to all origins');
console.log('   ✓ Frontend: Network accessible');
console.log('   ✓ API Proxy: Configured for mobile access');
console.log('\n' + '='.repeat(60) + '\n');
console.log('Starting servers...\n');
