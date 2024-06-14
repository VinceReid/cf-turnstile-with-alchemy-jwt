const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
// Chains
const POLYGON_CHAIN_ID = 137; // Replace with your required chainIds
const SEPOLIA_CHAIN_ID = 11155111; // Replace with your required chainIds
// get config vars
dotenv.config();

// Key Id from Alchemy dashboard.
const KEY_ID = {
  [POLYGON_CHAIN_ID]: process.env.KEY_ID_MAINNET, // Replace with your own Key Id
  [SEPOLIA_CHAIN_ID]: process.env.KEY_ID_SEPOLIA, // Replace with your own Key Id
};

// Private key decoded.
const PRIVATE_KEY = Buffer.from(process.env.PRIVATE_KEY, "base64").toString(); // Replace with your own private key

// Public key decoded.
const PUBLIC_KEY = Buffer.from(process.env.PUBLIC_KEY, "base64").toString(); // Replace with your own public key

var app = express();

app.use(express.json());
app.use(cors());

app.post("/verify-turnstile", async (req, res) => {
  console.log(req.body);
  const token = req.body.token;
  const chainId = req.body.chainId;
  let rpcToken;
  if (!token) {
    return res.status(400).send({ err: "Token not provided!" });
  }
  if (!chainId) {
    return res.status(400).send({ err: "Chain ID not provided!" });
  }
  // Define the options for signing the JWT
  // The "algorithm" field specifies the algorithm to use, which is 'RS256' (RSA with SHA-256)
  // This is one of the algorithms we support (others include RS384, RS512, ECDSA256, ECDSA384, ECDSA512)
  // The "expiresIn" field specifies when the token will expire, which is '10m' (10 minute) after being issued.
  // The shorter the expiration time, the more secure the token is.
  // In the "header" field we can add additional properties. In this case we're adding the "kid" filed which is the key id that is used by Alchemy to decided which public key should be used to verify the given JWT signature.
  // This should be the key id that you got from Alchemy Dashboard once you set up your key.
  const signOptions = {
    algorithm: "RS256",
    expiresIn: "6h",
    header: {
      kid: KEY_ID[chainId],
    },
  };
  // Validate the token by calling the
  // "/siteverify" API endpoint.
  let formData = new FormData();
  formData.append("secret", process.env.CF_SECRET_KEY);
  formData.append("response", token);
  const idempotencyKey = crypto.randomUUID();
  formData.append("idempotency_key", idempotencyKey);
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const firstResult = await fetch(url, {
    body: formData,
    method: "POST",
  });
  const firstOutcome = await firstResult.json();
  if (firstOutcome.success) {
    try {
      rpcToken = jwt.sign({}, PRIVATE_KEY, signOptions);
    } catch (err) {
      return res.status(400).send({ err: err });
    }
    return res.status(200).send({ rpcToken: rpcToken });
  }
  // A subsequent validation request to the "/siteverify"
  // API endpoint for the same token as before, providing
  // the associated idempotency key as well.
  const subsequentResult = await fetch(url, {
    body: formData,
    method: "POST",
  });

  const subsequentOutcome = await subsequentResult.json();
  if (subsequentOutcome.success) {
    try {
      rpcToken = jwt.sign({}, PRIVATE_KEY, signOptions);
    } catch (err) {
      return res.status(400).send({ err: err });
    }
    return res.status(200).send({ rpcToken: rpcToken });
  }
  return res.status(401).send({ err: subsequentOutcome.error });
});

app.post("/verify-jwt", async (req, res) => {
  console.log(req.body);
  const JWT = req.body.JWT;
  const chainId = req.body.chainId;
  let decoded;
  if (!JWT) {
    return res.status(400).send({ err: "JWT not provided!" });
  }
  if (!chainId) {
    return res.status(400).send({ err: "Chain ID not provided!" });
  }
  try {
    decoded = jwt.verify(JWT, PUBLIC_KEY, {
      algorithms: ["RS256"],
      complete: true,
    });
  } catch (err) {
    return res.status(400).send({ err: err });
  }
  if (decoded?.header?.kid === KEY_ID[chainId]) {
    return res.status(200).send({ accepted: true });
  }
  return res.status(401).send({ err: "Incorrect JWT provided!" });
});

var server = app.listen(3000, function () {
  console.log("Express App running at http://127.0.0.1:3000/");
});
