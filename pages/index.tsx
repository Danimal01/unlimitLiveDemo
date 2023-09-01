import { GateFiEventTypes, GateFiDisplayModeEnum, GateFiSDK } from '@gatefi/js-sdk'
import { FC, useRef, useEffect,useState  } from 'react'
import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';



const HomePage: FC = () => {
    const instanceSDK = useRef<any>()
    const [cryptoWidget, setCryptoWidget] = useState(null)
    const [showIframe, setShowIframe] = useState(false) // state to control iframe visibility
    const [quotes, setQuotes] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [showApiResponse, setShowApiResponse] = useState(true);
    const [showQuotesResponse, setShowQuotesResponse] = useState(true);
    const [customOrderId, setCustomOrderId] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [singleOrderResponse, setSingleOrderResponse] = useState(null);
    const [showSingleOrderResponse, setShowSingleOrderResponse] = useState(false);
    const [config, setConfig] = useState(null);


    const overlayInstanceSDK = useRef(null);
    const embedInstanceSDK = useRef(null);

    // State to hold the form values
    // Initial state for the form
    const [form, setForm] = useState({
        amount: '100',
        crypto: 'ETH',
        fiat: 'USD',
        partnerAccountId: '9e34f479-b43a-4372-8bdf-90689e16cd5b',
        payment: 'BANKCARD',
        region: 'US',
    });

    const [orderParams, setOrderParams] = useState({
        start: "2023-07-22",
        end: "2024-08-22",
        limit: "5",
        skip: "0",
    });

        // Event handler for custom order ID field
    const handleCustomOrderIdChange = (e) => {
        setCustomOrderId(e.target.value);
    };
    
    // Event handler for wallet address field
    const handleWalletAddressChange = (e) => {
        setWalletAddress(e.target.value);
    };

    var CryptoJS = require("crypto-js");
    console.log(CryptoJS.HmacSHA1("Message", "Key"));

    let secretkey = "GSLDrYtqLmXDJRHbqtUwDQLwKBbEgPvu"
    let prodSecretkey = "xxxxxxxx"


    //string will be method + api path
    let dataVerify = "GET" + "/onramp/v1/configuration";
    let dataVerify1 = "GET" + "/onramp/v1/quotes";
    let dataVerify2 = "GET" + "/onramp/v1/orders";
    let dataVerify3 = "GET" + "/onramp/v1/orders/d0c0e8bd3bb169dbc29a9db673391694f989e300e7ca9ed18dda0202215b9981";
    let dataVerify4 = "GET" + "/onramp/v1/buy";



    // Hash the secret key with the data
    function calcAuthSigHash(data) {
      let hash = CryptoJS.HmacSHA256(data, secretkey);
      return CryptoJS.enc.Hex.stringify(hash);
    }

    // Hash the secret key with the data
    function calcAuthSigHashProd(data) {
        let hash = CryptoJS.HmacSHA256(data, prodSecretkey);
        return CryptoJS.enc.Hex.stringify(hash);
        }

    console.log(calcAuthSigHash(dataVerify))

    console.log('Quotes Sig Test', calcAuthSigHash(dataVerify1))
    console.log(calcAuthSigHash(dataVerify2))
    console.log('get single order',calcAuthSigHash(dataVerify3))
    console.log('buybuybuy',calcAuthSigHash(dataVerify4))

    console.log('Prod get quotes',calcAuthSigHashProd(dataVerify1))
    console.log('Prod buy Asset',calcAuthSigHashProd(dataVerify4))
    console.log('Config Prod',calcAuthSigHashProd(dataVerify))

    let signatureConfig = calcAuthSigHash(dataVerify)
    let signature = calcAuthSigHash(dataVerify4)
    let signature1 = calcAuthSigHash(dataVerify1)
    let signature2 = calcAuthSigHash(dataVerify2)
    let signature3 = calcAuthSigHash(dataVerify3)
    let signatureBuyAssetProd = calcAuthSigHashProd(dataVerify4)

    let signatureQuotesProd = calcAuthSigHashProd(dataVerify1)

    const handleOrderParamChange = (e) => {
        setOrderParams({
            ...orderParams,
            [e.target.name]: e.target.value,
        });
    };

    const getConfig = async () => {
        const queryString = new URLSearchParams(form).toString();

        const response = await fetch(`https://unlimit-live-demo.vercel.app/api/proxy?endpoint=/onramp/v1/configuration`, {
            method: "GET",
            headers: {
                "access-control-allow-headers": "Accept",
                "signature": signatureConfig,
                "api-key": "VrHPdUXBsiGtIoWXTGrqqAwmFalpepUq",
            }
        });
        const data = await response.json();
        setConfig(data);

    };

    const getOrders = async (params) => {
        const response = await fetch(`https://unlimit-live-demo.vercel.app/api/proxy?endpoint=/onramp/v1/orders&${params}`, {
            method: "GET",
            redirect: 'follow',
            headers: {
                "access-control-allow-headers": "Accept",
                "signature": signature2,
                "api-key": "VrHPdUXBsiGtIoWXTGrqqAwmFalpepUq",
            }
        });
        const data = await response.json();
        setApiResponse(data);
        setShowApiResponse(true);  // Add this line
        return data;
    };

    const handleOrderFormSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(orderParams).toString();
        getOrders(params);
    };

    // Function to get single order
    const getSingleOrder = async (e) => {
        e.preventDefault();

        let dataVerify3 = "GET" + `/onramp/v1/orders/${customOrderId}`;
        let signature3 = calcAuthSigHash(dataVerify3);
    
        const response = await fetch(`https://unlimit-live-demo.vercel.app/api/proxy?endpoint=/onramp/v1/orders/${customOrderId}&walletAddress=${walletAddress}`, {
            method: "GET",
            redirect: 'follow',
            headers: {
                "access-control-allow-headers": "Accept",
                "signature": signature3,
                "api-key": "VrHPdUXBsiGtIoWXTGrqqAwmFalpepUq",
            }
        });
        const data = await response.json();
        setSingleOrderResponse(data);
        setShowSingleOrderResponse(true);  
        return data;
    }; 




        

const handleOnClickEmbed = () => {
    if (!embedInstanceSDK.current) {
        createEmbedSdkInstance();
    }

    embedInstanceSDK?.current?.show()
}

let isOverlayVisible = false; // A flag to keep track of the overlay's visibility status

// Function to create a new overlay SDK instance
const createOverlaySdkInstance = () => {
    const randomString = require('crypto').randomBytes(32).toString('hex');

    overlayInstanceSDK.current = typeof document !== 'undefined' && new GateFiSDK({
        merchantId: "9e34f479-b43a-4372-8bdf-90689e16cd5b",
        displayMode: GateFiDisplayModeEnum.Overlay,
        nodeSelector: "#overlay-button",
        isSandbox: true,
        walletAddress: "0xc458f721D11325E38f781a9C58055de489178BF2",
        email: "d.dadkhoo@unlimit.com",
        externalId: randomString,
        defaultFiat: {
            currency: "EUR",
            amount: "500",
        },
        defaultCrypto: {
            currency: "BTC"
        },
    })
}

const handleOnClick = () => {
    if (!overlayInstanceSDK.current) {
        createOverlaySdkInstance();

        const targetNode = document.getElementById('overlay-button');
        const observerOptions = {
            childList: true,
        }
        const observer = new MutationObserver((mutationsList, observer) => {
            for(let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    overlayInstanceSDK.current.destroy();
                    overlayInstanceSDK.current = null;

                    observer.disconnect();
                }
            }
        });
        observer.observe(targetNode, observerOptions);
    }

    // Toggle the overlay visibility
    if (isOverlayVisible) {
        overlayInstanceSDK?.current?.hide();
        isOverlayVisible = false;
    } else {
        overlayInstanceSDK?.current?.show();
        isOverlayVisible = true;
    }
}

// Function to create a new embed SDK instance
const createEmbedSdkInstance = () => {
    const randomString = require('crypto').randomBytes(32).toString('hex');

    embedInstanceSDK.current = typeof document !== 'undefined' && new GateFiSDK({
        merchantId: "9e34f479-b43a-4372-8bdf-90689e16cd5b",
        displayMode: GateFiDisplayModeEnum.Embedded,
        nodeSelector: "#embed-button",
        isSandbox: true,
        walletAddress: "0xc458h721D11322E34f781a9C58055de489178BF2",
        email: "d.dadkhoo@unlimit.com",
        externalId: randomString,
        defaultFiat: {
            currency: "USD",
            amount: "30",
        },
        defaultCrypto: {
            currency: "ETH"
        },
    })
}

    // Function to handle 'Hosted Flow' button click
    const handleHostedFlowClick = () => {
        setShowIframe(true)
    }




    
    const handleOnClick1 = async () => {
        instanceSDK?.current?.show();
    
        const randomString = require('crypto').randomBytes(32).toString('hex');
    
        // Open a blank window immediately
        const newWindow = window.open('', '_blank');
    
        const response = await fetch(`https://unlimit-live-demo.vercel.app/api/proxy?endpoint=/onramp/v1/buy&amount=23&crypto=ETH&fiat=USD&orderCustomId=${randomString}&partnerAccountId=9e34f479-b43a-4372-8bdf-90689e16cd5b&payment=BANKCARD&redirectUrl=https://www.google.com/&region=US&walletAddress=0xc458f721D11322E36f781a9C58055de489178BF2`, {
            redirect: 'follow',
            headers: {
                "api-key": 'VrHPdUXBsiGtIoWXTGrqqAwmFalpepUq',
                "signature": signature
            }
            
        });
        
        console.log('Response Headers:', [...response.headers]);

        if (response.ok) {
            const finalUrl = response.headers.get('X-Final-Url');
            if (finalUrl && newWindow) {
                newWindow.location.href = finalUrl; // Redirect the blank window to the final URL
            }
        } else {
            const data = await response.json();
            setCryptoWidget(data);
        }
    }
    

  const handleOnClickBuyAsset = async () => {
    instanceSDK?.current?.show()

    const randomString = require('crypto').randomBytes(32).toString('hex');



    const response = await fetch(`https://api.gatefi.com/onramp/v1/buy?amount=1000&crypto=ETH&fiat=MXN&orderCustomId=${randomString}&partnerAccountId=xxxxxxxx&payment=BANKCARD_MX&redirectUrl=https://www.google.com/&region=HK&walletAddress=0xc458f721D11322E36f781a9C58055de489178BF2`, {
        redirect: 'follow',
        headers: {
            "api-key": 'xxxxxxxx',
            "signature": signatureBuyAssetProd
        }
    })
    if (response.ok) {
      const finalUrl = response.headers.get('X-Final-Url');
      if (finalUrl) {
          window.open(finalUrl, '_blank');
      }
  } else {
      const data = await response.json();
      setCryptoWidget(data);
  }
}



//TEST NET
  const getQuotes = async () => {
    // Build the URL query string from the form values
    const queryString = new URLSearchParams(form).toString();
    const response = await fetch(`https://unlimit-live-demo.vercel.app/api/proxy?endpoint=/onramp/v1/quotes&${queryString}`, {
        method: "GET",
        redirect: 'follow',
        headers: {
            "access-control-allow-headers": "Accept",
            "signature": signature1,
            "api-key": "VrHPdUXBsiGtIoWXTGrqqAwmFalpepUq"
        }
    });
    
    const data = await response.json();  // You probably want the JSON response, not the URL
    setQuotes(data);

}



    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        getQuotes();
        setShowQuotesResponse(true);

    }

    // Handle form field changes
    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    // Create a click handler
    const handleGetQuotesClick = async () => {
        const data = await getQuotes();
        setQuotes(data);  // Set the response to the quotes state variable
    }


    // 2. Use useEffect to call getQuotes when the component mounts
    useEffect(() => {
        getQuotes().then(data => {
            // 3. Set the response to the quotes state variable
            setQuotes(data);
        });
    }, []); 




    

    return (
        <>
        
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>GateFi </h2>
      
      
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
              <button onClick={handleOnClick}>Overlay</button>
              <button onClick={handleOnClickEmbed}>Embed</button>
              <button onClick={handleOnClick1}>Buy Asset API GET</button>
              {/* <button onClick={handleOnClickBuyAsset}>Buy Asset API PROD</button> */}
              <button onClick={handleHostedFlowClick}>Hosted Flow</button>


            </div>
      
            {showIframe && (
              <iframe
                src="https://onramp-sandbox.gatefi.com/?merchantId=9e34f479-b43a-4372-8bdf-90689e16cd5b"
                style={{ width: '100%', height: '600px', margin: '10px' }}
              />
            )}

            <div id="overlay-button"></div>
            <div id="embed-button"></div>

            {/* Form for the query parameters */}
            <div style={{ border: '1px solid #000', padding: '10px', borderRadius: '5px', margin: '10px', maxWidth: '500px' }}>
              <h3>Get Quotes</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'wrap' }}>
                <label>
                  Amount:
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required />
                </label>
                <label>
                  Crypto:
                  <input type="text" name="crypto" value={form.crypto} onChange={handleChange} required />
                </label>
                <label>
                  Fiat:
                  <input type="text" name="fiat" value={form.fiat} onChange={handleChange} required />
                </label>
                <label>
                  Partner Account ID:
                  <input type="text" name="partnerAccountId" value={form.partnerAccountId} onChange={handleChange} required />
                </label>
                <label>
                  Payment:
                  <input type="text" name="payment" value={form.payment} onChange={handleChange} required />
                </label>
                <label>
                  Region:
                  <input type="text" name="region" value={form.region} onChange={handleChange} required />
                </label>
                <button type="submit">Get Quotes</button>
              </form>
            </div>
      
            {/* Display the quotes */}
            {showQuotesResponse && quotes && (
            <div style={{ position: "relative", border: "1px solid #000", margin: "10px", padding: "10px", borderRadius: "5px", maxWidth: "500px", maxHeight: "300px", overflow: "auto" }}>
                <button style={{ position: "absolute", right: "10px", top: "10px" }} onClick={() => setShowQuotesResponse(false)}>X</button>
                <pre>{JSON.stringify(quotes, null, 2)}</pre>
            </div>
            )}
      
            {/* Form for order parameters */}
            <div style={{ border: '1px solid #000', padding: '10px', borderRadius: '5px', margin: '10px', maxWidth: '500px' }}>
              <h3>Get Orders</h3>
              <form onSubmit={handleOrderFormSubmit} style={{ display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'wrap' }}>
                <label>
                  Start Date:
                  <input type="date" name="start" value={orderParams.start} onChange={handleOrderParamChange} />
                </label>
                <label>
                  End Date:
                  <input type="date" name="end" value={orderParams.end} onChange={handleOrderParamChange} />
                </label>
                <label>
                  Limit:
                  <input type="number" name="limit" value={orderParams.limit} onChange={handleOrderParamChange} />
                </label>
                <label>
                  Skip:
                  <input type="number" name="skip" value={orderParams.skip} onChange={handleOrderParamChange} />
                </label>
                <button type="submit">Get Orders</button>
              </form>
            </div>
      
            {showApiResponse && apiResponse && (
              <div style={{ position: "relative", border: "1px solid #000", margin: "10px", padding: "10px", borderRadius: "5px", maxWidth: "500px", maxHeight: "300px", overflow: "auto" }}>
                <button style={{ position: "absolute", right: "10px", top: "10px" }} onClick={() => setShowApiResponse(false)}>X</button>
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            )}

            
            <div style={{ border: '1px solid #000', padding: '10px', borderRadius: '5px', margin: '10px', maxWidth: '500px' }}>
                <h3>Get Single Order</h3>
                <form onSubmit={getSingleOrder} style={{ display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'wrap' }}>
                <label>
                    Custom Order ID:
                    <input type="text" name="customOrderId" value={customOrderId} onChange={handleCustomOrderIdChange} required />
                </label>
                <label>
                    Wallet Address:
                    <input type="text" name="walletAddress" value={walletAddress} onChange={handleWalletAddressChange} required />
                </label>
                <button type="submit">Get Single Order</button>
                </form>
            </div>

            {/* Display the single order */}
            {showSingleOrderResponse && singleOrderResponse && (
            <div style={{ position: "relative", border: "1px solid #000", margin: "10px", padding: "10px", borderRadius: "5px", maxWidth: "500px", maxHeight: "300px", overflow: "auto" }}>
                <button style={{ position: "absolute", right: "10px", top: "10px" }} onClick={() => setShowSingleOrderResponse(false)}>X</button>
                <pre>{JSON.stringify(singleOrderResponse, null, 2)}</pre>
            </div>
            )}

            <button onClick={getConfig}>Get Config</button>
            {config && (
                <div style={{ position: "relative", border: "1px solid #000", margin: "10px", padding: "10px", borderRadius: "5px", maxWidth: "500px", maxHeight: "300px", overflow: "auto" }}>
                    <button style={{ position: "absolute", right: "10px", top: "10px" }} onClick={() => setConfig(null)}>X</button>
                    <pre>{JSON.stringify(config, null, 2)}</pre>
                </div>
            )}

      


          </div>
        </>
      )
      
}

export default HomePage;
