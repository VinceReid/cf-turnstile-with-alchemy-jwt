// Import the built-in fs module for writing keys to files
const fs = require("fs");

// Reads the private key from the pem file and then encodes to base64 and logs to the console for copying to env file.
function keysToBase64() {
  const privateKey = fs.readFileSync("private_key.pem");
  const PrivateKeyBase64 = Buffer.from(privateKey).toString('base64')
  const publicKey = fs.readFileSync("public_key.pem");
  const PublicKeyBase64 = Buffer.from(publicKey).toString('base64')
  console.log(`\nPRIVATE_KEY encoded to base64:\n`);
  console.log(PrivateKeyBase64);
  console.log(`\n\nPUBLIC_KEY encoded to base64:\n`);
  console.log(PublicKeyBase64);

  /** Uncomment below to enable a view of the decoded base64 to ensure that the formatting has remained intact. **/
  const decodedPrivateKey = Buffer.from(PrivateKeyBase64, 'base64').toString()
  console.log(`\nDecoded PRIVATE_KEY base64:\n`);
  console.log(decodedPrivateKey);
  const decodedPublicKey = Buffer.from(PublicKeyBase64, 'base64').toString()
  console.log(`\n\nDecoded PUBLIC_KEY base64:\n`);
  console.log(decodedPublicKey);
}

// Execute the function to console log the private key in base64 for entering into AWS server env
keysToBase64();