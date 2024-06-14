# Alchemy-api-cf-turnstile-response
Proxy API to process Cloudfront turnstile responses via site-verify. Returns a JWT response that can be used for Alchemy API web3 requests.

#### Developed with:

Node version: v19.4.0

## Getting started

1. Install the dependencies using `npm install`.

2. Follow instructions in README section 'Environment Variable settings' below. Ensure all environment variable are set

3. Then, run the development server:
   ```
   bash
   npm run start
   ```
    Starts a server at: [http://localhost:3000](http://localhost:3000) 

1. Send api requests with Cloudfront token and network chain ID to [http://localhost:3000/verify-turnstile](http://localhost:3000/verify-turnstile).<br><br>
   Requests should include the Cloudfront turnstile 'token' and the web3 'chainId' in the body of the PUSH request. <br>
   The chain ID must match one of the Alchemy APPs to ensure that the correct private key is used in JWT formation. <br>
   #### Request example
    ```const url = "http://localhost:3000/verify-turnstile";
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        token: token,
        chainId : `${INPUT_CHAIN_ID}`,
      }),
      headers: { "Content-Type": "application/json" },
    });
    ```
    <br>
    A JWT will be returned. The JWT can be used for api calls to Alchemy API.<br><br>

2. Test the generated JWT either in your Alchemy account under JWT management section or, edit and use the provided script - `requestData.js`.

3. To utilize the JWT as a verification check.<br>
  Send api an api request with the JWT and network chain ID to [http://localhost:3000/verify-jwt](http://localhost:3000/verify-jwt).<br>
  The JWT will be verified against using the PUBLIC_KEY, with a check that it is not expired and that the Alchemy App KEY_ID is correct for the chain in use.
   

## Alchemy request with JWT
Once you have received a JWT from the API you can use it in your calls to Alchemy.
Edit the `requestData.js` file to test a call.

## AWS Lambda serverless implementation
Set up a AWS Lambda function using the files in serverless-express folder.
This folder contains a altered version of index.js where serverless-http wraps the function to enable a handler compatible with AWS Lambda function calls. dotenv package is removed so ensure your ENVs are added to AWS Lambda environment before testing. 

Navigate to this directory in your terminal and `npm install` the node packages locally. 

### Lambda function settings

Update the 'expiresIn' option in signOptions to adjust the length of time the JWT is valid for.

expiresIn: expressed in seconds or a string describing a time span vercel/ms.
Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").

```
  const signOptions = {
    algorithm: "RS256",
    expiresIn: "6h",
    header: {
      kid: KEY_ID[chainId],
    },
  };
```

To prepare the files for upload to AWS Lambda you will need to select all files in the folder (Not the folder itself) and compress into a zip file. 
Upload the zip file to you AWS lambda function (IMPORTANT: in the Code section of AWS, rename the file to index.js), add a AWS API gateway as a trigger.

** Optional - For improved cold-start performance use `npm run build` to esbuild the folder into a bundle.<br>
Then compress the output folder `serverless-api.js` into a zip file for upload to AWS Lambda.

## Environment Variable settings

### Environment variables

Add a .env file with the below variables.

### Cloudfront Turnstile
Get your cloudfront turnstile secret key.

### Alchemy
1. Use the script provided - `generateKeyPair.js` to generate a new key pair and then use the entire content of the relevant .pem file contents (including headers and footers) e.g.<br><br>
   ```
   -----BEGIN RSA PRIVATE KEY-----
   ....
   YFHqoWkj/22pVVy3D6ktVLCoOYW02tGuLQgfKG1xRv85
   ....
   -----END RSA PRIVATE KEY-----
   ```
   
   Generates a new key pair using RSA algorithm with a modulus length of 2048 bits ( size of the key )
   Repeat for each Alchemy API app you require e.g. Sepolia, Mainnet etc.
   RSA is related to the RS256, RS384, RS512 algorithms. We support the following algorithms: RS256, RS384, RS512, ECDSA256, ECDSA384, ECDSA512.

1. Add the public key to the relevant apps on Alchemy. <br><br>
   **Note:** You need to encode your keys to base64 before adding them to the .env. It is then decoded in the API. <br>
    This prevents the keys from becoming unformatted when adding the environment variables to server provider such as AWS. 
    The base64 encoded keys will be logged during key generation. You can also run `keysToBase64.js` after to perform the same action. Then Add the keys to .env as below.

2. Public key is to be added to Alchemy in its .pem file state (not encoded to base64).

3. Get the Alchemy App Key IDs and add to the .env. 
   **Note:** The App key is made available after adding your public key in Alchemy JWT options.

### ENV components

```bash
CF_SECRET_KEY=<your-cf-secret-key>
KEY_ID_MAINNET=<your-alchemy-app-key-id-mainnet>
KEY_ID_SEPOLIA=<your-alchemy-app-key-id-mainnet>
PRIVATE_KEY=<your-alchemy-private-key-base64-encoded>
PUBLIC_KEY=<your-alchemy-public-key-base64-encoded>
```

------

## File structure

    .
    ├── serverless-express
    |   ├──index.js
    |   ├──package.json
    |
    ├── generateKeyPair.json
    ├── index.js            # app entry point
    ├── package.json
    ├── keysToBase64.json
    ├── requestData.json
    .