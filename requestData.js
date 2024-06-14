const axios = require('axios'); // Import axios library

const JWT = "JWT"; // Replace with your JWT

// Set up data object for the request
const data = {
  method: 'eth_blockNumber', // Set request method
  params: [], // No parameters are required for eth_blockNumber
  id: 1,
  jsonrpc: "2.0"
}

// Set up headers object for the request
const headers = {
  'Content-Type': 'application/json', // Needed for a JSON-RPC request
  'Authorization': `Bearer ${JWT}`,
}

// Send POST request using axios
axios.post('https://eth-sepolia.g.alchemy.com/v2', data, { headers: headers })
  .then(response => console.log(response.data.result)) // Log response data
  .catch(error => console.error(error)); // Log any errors