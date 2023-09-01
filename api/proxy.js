

const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const endpoint = req.query.endpoint;
    const url = require('url');

    const parsedUrl = url.parse(req.url, true);
    const queryString = new URLSearchParams(parsedUrl.query).toString().replace("endpoint=" + encodeURIComponent(endpoint), "");
    const apiUrl = `https://api-sandbox.gatefi.com${endpoint}?${queryString}`;

    try {
        const response = await fetch(apiUrl, {
            method: req.method,
            mode: 'no-cors',
            headers: {
                "access-control-allow-headers": "Accept",
                "signature": req.headers.signature,
                "api-key": req.headers["api-key"],
            }
        });

        const contentType = response.headers.get("content-type");

        
        
        // Extract the X-Final-Url header from the original response
        const finalUrl = response.headers.get('X-Final-Url');

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            // Check if the endpoint is /onramp/v1/buy before setting the header
            if (endpoint === '/onramp/v1/buy' && finalUrl) {
                res.setHeader('X-Final-Url', finalUrl); // Set the header in the proxy response
            }
            res.status(200).json(data);
        } else {
            const rawText = await response.text();
            // Check if the endpoint is /onramp/v1/buy before setting the header
            if (endpoint === '/onramp/v1/buy' && finalUrl) {
                res.setHeader('X-Final-Url', finalUrl); // Set the header in the proxy response
            }
            res.status(200).send(rawText);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: 'Unable to fetch data' });
    }
};





