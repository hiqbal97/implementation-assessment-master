require('dotenv').config();
const path = require('path');
const express = require('express');
const { Client, Config, CheckoutAPI } = require('@adyen/api-library');
const { PORT, API_KEY, MERCHANT_ACCOUNT, ENVIRONMENT } = require('./config');


// This is the server-side configuration.  It pulls the information supplied in the .env file to create an instance of the checkout API
const config = new Config();
// Set your X-API-KEY with the API key from the Customer Area.
config.apiKey = API_KEY;
config.merchantAccount = MERCHANT_ACCOUNT;
const client = new Client({ config });
client.setEnvironment(ENVIRONMENT);
const checkout = new CheckoutAPI(client);

const app = express();
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'index.html'));
});

app.use(express.static(__dirname + '/public'));

// this endpoint is (almost!) working
app.post('/getPaymentMethods', (req, res) => {
  const {merchantAccount} = req.body;
  checkout.paymentMethods({
    merchantAccount,
    channel: "Web"
  })
    .then(paymentMethodsResponse => res.json(paymentMethodsResponse))
    .catch((err) => {
      res.status(err.statusCode);
      res.json({ message: err.message });
    });
});

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}


// build this endpoint using the example above, along with our dropin documentation -> https://docs.adyen.com/online-payments/web-drop-in/integrated-before-5-0-0?tab=codeBlockmethods_request_7#step-3-make-a-payment
app.post('/makePayment', async (req, res) => {
  // Your code here
  const response = await checkout.payments({
    channel: "Web",
    amount: {
      currency: "USD",
      value: 10000
    },
    reference: makeid(20),
    returnUrl: "http://localhost:3000",
    merchantAccount: process.env.MERCHANT_ACCOUNT,
    browserInfo: req.body.browserInfo,
    origin: "http://localhost:3000",
    paymentMethod: req.body.paymentMethod.type.includes("ideal") ? 
    {
      issuer: req.body.paymentMethod.issuer,
    } 
    : req.body.paymentMethod
  })
    .then(response => res.json(response))
    .catch((err) => {
      res.status(err.statusCode);
      res.json({ message: err.message });
    });
});

// build this endpoint as well, using the documentation -> https://docs.adyen.com/online-payments/web-drop-in/integrated-before-5-0-0?tab=codeBlockmethods_request_7#step-5-additional-payment-details
app.post('/additionalDetails', async (req, res) => {
  try {
    const response = await checkout.paymentsDetails({
      details: req.body.details
    });
      res.json(response);
  } catch (err) {
        res.status(err.statusCode);
        res.json({ message: err.message });
  }
})

app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});
