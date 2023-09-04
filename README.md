# unlimit-test-app


1) Run npm i
2) Run 'vercel dev' to start the app
3) Add "http://localhost:3000/" to the base of all the API endpoint's that are currently "/api/xxxxx/xxxx...". So for example, "/api/proxy?endpoint=/onramp/v1/configuration" should be "http://localhost:3000/api/proxy?endpoint=/onramp/v1/configuration". This change is required for all API endpoint to work on your local since we have created serverless Vercel functions that acts as a proxy for our API requests.
3) Change the secret key, api key, and partnerAccountd id within the code if you want to test on your own sandbox account. The account and keys in the code will work and are for general testing purposes for anyone interested. Please reach out to @Dub023 on Telegram to get your own sandbox account and keys.

This app is deployed using Vercel- https://unlimit-live-demo.vercel.app/

