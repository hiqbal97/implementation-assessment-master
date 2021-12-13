const config = {
  clientKey: 'test_PV23NG3VVBHFRI4GRISZXEWQPU3UUXNS',
  merchantAccount: 'AdyenRecruitment_NY2',
  countryCode: "NL",
  shopperLocale: "en_US",
  amount: { currency: "USD", value: 10000 }
};

const postRequest = async (url, payload) => {
  try {
    const response = await fetch(url, {
      url,
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(payload),
      json: true
    });

    return response.json();
  } catch (err) {
    console.error(err.message);
  };
};

const showFinalResult = (response) => {
  const container = document.getElementById("container");
  container.innerHTML = (`
    <div id="results">
      <h1 class="results-message">
        Result: ${response.resultCode}
      </h1>
      <h1 class="results-message"> pspReference: ${response.pspReference} </h1>
    </div>
  `);
};

const parseQueryParameter = (qParameterKey) => {
  let query = window.location.search.substring(1);
  let vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == qParameterKey) {
          return decodeURIComponent(pair[1])
      }
  }
  console.warn('Query variable %s not found', variable);
};

const handleRedirect = async () => {
  if(/redirectResult/.test(document.location.search)){
    const paymentDetailsResponse = await postRequest('/additionalDetails', {
      details: {
        redirectResult: parseQueryParameter('redirectResult')
      }
    });

    showFinalResult(paymentDetailsResponse);
    return true;
  }
  return false;
};

const createDropinConfig = paymentMethodsResponse => {
  return {
    paymentMethodsResponse,
    clientKey: config.clientKey,
    merchantAccount: config.merchantAccount,
    locale: config.shopperLocale,
    removePaymentMethods: ["paypal", "alipay", "unionpay"],
    environment: "TEST",
    onSubmit: async (state, dropin) => {
      const response = await postRequest('/makePayment', state.data);
      if (response.action) {
        dropin.handleAction(response.action);
      } else {
        showFinalResult(response);
      };
    },
    onAdditionalDetails: async (state, dropin) => {
      const response = await postRequest('/additionalDetails', state.data);
      if (response.action) {
        dropin.handleAction(response.action);
      } else {
        showFinalResult(response);
      };
    }
  };
};

window.addEventListener('load', async e => {

  const isRedirect = await handleRedirect();
  if(!isRedirect){
    const paymentMethodsResponse = await postRequest('/getPaymentMethods', {
      merchantAccount: config.merchantAccount,
      countryCode: config.countryCode,
      shopperLocale: config.shopperLocale,
      amount: config.amount
    });

    const checkout = new AdyenCheckout(createDropinConfig(paymentMethodsResponse));
    const dropin = checkout.create('dropin').mount('#dropin-container');
  }
});