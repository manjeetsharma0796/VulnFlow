// Quick script to check VFT token balance for a specific address
// Run with: node scripts/check-balance.js

const https = require('https');

const VFT_ADDRESS = '0x14d1C30fd8647979DCDe3F5EAa296C195B84c0EF';
const WALLET_ADDRESS = '0x7FA3B1bCc3EEDCdDE1ae114E940a34FBfCD6173B';
const RPC_URL = 'https://testnet.evm.nodes.onflow.org';

// ERC20 balanceOf function signature: balanceOf(address) -> uint256
// Function selector: 0x70a08231
// We need to encode the wallet address as a 32-byte parameter
const balanceOfSelector = '0x70a08231';
const paddedAddress = WALLET_ADDRESS.slice(2).padStart(64, '0');
const callData = balanceOfSelector + paddedAddress;

const requestBody = JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [
        {
            to: VFT_ADDRESS,
            data: callData,
        },
        'latest',
    ],
    id: 1,
});

console.log('Checking VFT balance for:', WALLET_ADDRESS);
console.log('VFT Token Contract:', VFT_ADDRESS);
console.log('RPC:', RPC_URL);
console.log('');

const url = new URL(RPC_URL);
const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
    },
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);

            if (response.error) {
                console.error('❌ RPC Error:', response.error.message);
                console.error('Details:', response.error);
                return;
            }

            if (!response.result) {
                console.error('❌ No result returned from RPC');
                console.error('Response:', response);
                return;
            }

            // Convert hex result to decimal
            const balanceHex = response.result;
            const balanceWei = BigInt(balanceHex);
            const decimals = 18n; // VFT uses 18 decimals (standard ERC20)
            const divisor = 10n ** decimals;
            const balanceTokens = Number(balanceWei) / Number(divisor);

            console.log('✅ Balance (raw hex):', balanceHex);
            console.log('✅ Balance (wei):', balanceWei.toString());
            console.log('✅ Balance (tokens):', balanceTokens.toFixed(6), 'VFT');
            console.log('');

            if (balanceWei === 0n) {
                console.log('⚠️  This address has ZERO VFT tokens');
                console.log('   Possible reasons:');
                console.log('   - The wallet has not claimed/received any tokens yet');
                console.log('   - Tokens were transferred out');
                console.log('   - The contract address or chain might be incorrect');
            } else {
                console.log('✅ This address HAS tokens! The contract is working correctly.');
                console.log('   If the website shows 0, possible issues:');
                console.log('   - User wallet is connected to a different chain');
                console.log('   - Wallet address mismatch (check connected account)');
                console.log('   - UI formatting issue (already fixed with <0.01 display)');
            }
        } catch (err) {
            console.error('❌ Failed to parse response:', err.message);
            console.error('Raw response:', data);
        }
    });
});

req.on('error', (err) => {
    console.error('❌ Request failed:', err.message);
});

req.write(requestBody);
req.end();
