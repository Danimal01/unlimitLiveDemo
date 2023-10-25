const fetch = require('node-fetch');
const crypto = require('crypto');

const secretKey = process.env.SECRET_KEY;
const apiKey = process.env.API_KEY;


// Hash the secret key with the data using the native Node.js crypto module
function calcAuthSigHash(data) {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(data);
    return hmac.digest('hex');
}

module.exports = async (req, res) => {
    console.log("SECRET_KEY:", secretKey);
    console.log("API_KEY:", apiKey);
    const endpoint = req.query.endpoint;
    const url = require('url');

    const parsedUrl = url.parse(req.url, true);
    const queryString = new URLSearchParams(parsedUrl.query).toString().replace("endpoint=" + encodeURIComponent(endpoint), "");
    const apiUrl = `https://api-sandbox.gatefi.com${endpoint}?${queryString}`;

    const dataVerify = req.method + endpoint; // Adjust as needed based on the endpoint
    const signature = calcAuthSigHash(dataVerify);

    try {
        const response = await fetch(apiUrl, {
            method: req.method,
            headers: {
                "signature": signature,
                "api-key": apiKey,
            }
        });

        const contentType = response.headers.get("content-type");
        const externalApiUrl = response.url;
        res.setHeader('X-External-Api-Url', externalApiUrl);

        const finalUrl = response.headers.get('X-Final-Url');
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (endpoint === '/onramp/v1/buy' && finalUrl) {
                res.setHeader('X-Final-Url', finalUrl);
            }
            res.status(200).json(data);
        } else {
            const rawText = await response.text();
            if (endpoint === '/onramp/v1/buy' && finalUrl) {
                res.setHeader('X-Final-Url', finalUrl);
            }
            res.status(200).send(rawText);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: 'Unable to fetch data' });
    }
};
