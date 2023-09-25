// Import necessary modules
const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const app = express();
const port = 3000;

// Store user secrets in-memory for this example (in production, use a database)
const userSecrets = {};

// Serve static files from the public directory
app.use(express.static('public'));

// Register 2FA route
app.get('/register', (req, res) => {
  // Generate a secret key for the user
  const secret = speakeasy.generateSecret({ length: 20 });
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: 'Your App Name',
    algorithm: 'sha1',
  });

  // Store the secret key for this user (in production, store it securely)
  userSecrets[req.ip] = secret;

  // Generate a QR code for the user to scan
  QRCode.toDataURL(otpauthUrl, (err, data_url) => {
    if (err) {
      res.status(500).send('Error generating QR code');
    } else {
      res.send(`<img src="${data_url}" alt="QR Code" /><br/><a href="/verify">Verify 2FA</a>`);
    }
  });
});

// Verify 2FA route
app.get('/verify', (req, res) => {
  // Retrieve the user's secret key (in production, fetch it securely)
  const secret = userSecrets[req.ip];

  if (!secret) {
    res.status(400).send('Secret key not found');
    return;
  }

  // Get the user's inputted TOTP code from the query parameter
  const userToken = req.query.token;

  if (!userToken) {
    // Display the input form
    res.send(`
      <form action="/verify" method="get">
        <input type="text" name="token" placeholder="Enter your code" />
        <button type="submit">Validate</button>
      </form>
    `);
  } else {
    // Validate the TOTP code
    const isValid = speakeasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token: userToken,
      window: 1, // Number of time steps to allow before/after current time
    });

    if (isValid) {
      res.send('Authentication Successful');
    } else {
      res.send('Authentication Failed');
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});