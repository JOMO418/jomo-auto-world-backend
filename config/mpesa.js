// config/mpesa.js
const axios = require('axios');

// M-Pesa Configuration
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE || '174379',
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/payment/mpesa/callback',
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
};

// Get OAuth token
const getOAuthToken = async () => {
  try {
    const auth = Buffer.from(
      `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`
    ).toString('base64');

    const url = mpesaConfig.environment === 'live'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('❌ M-Pesa OAuth error:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa OAuth token');
  }
};

// Generate password for STK Push
const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(
    `${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`
  ).toString('base64');
  
  return { password, timestamp };
};

// Format phone number (remove leading 0 or + and add 254)
const formatPhoneNumber = (phone) => {
  phone = phone.toString().replace(/\s/g, '');
  
  if (phone.startsWith('0')) {
    return '254' + phone.slice(1);
  } else if (phone.startsWith('+')) {
    return phone.slice(1);
  } else if (phone.startsWith('254')) {
    return phone;
  } else {
    return '254' + phone;
  }
};

// Initiate STK Push
const initiateSTKPush = async (phone, amount, accountReference, transactionDesc) => {
  try {
    const token = await getOAuthToken();
    const { password, timestamp } = generatePassword();
    const formattedPhone = formatPhoneNumber(phone);

    const url = mpesaConfig.environment === 'live'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const payload = {
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: mpesaConfig.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: mpesaConfig.callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ STK Push initiated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ STK Push error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment');
  }
};

// Query STK Push transaction status
const querySTKStatus = async (checkoutRequestId) => {
  try {
    const token = await getOAuthToken();
    const { password, timestamp } = generatePassword();

    const url = mpesaConfig.environment === 'live'
      ? 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';

    const payload = {
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ STK Query error:', error.response?.data || error.message);
    throw new Error('Failed to query M-Pesa transaction status');
  }
};

module.exports = {
  mpesaConfig,
  getOAuthToken,
  generatePassword,
  formatPhoneNumber,
  initiateSTKPush,
  querySTKStatus
};