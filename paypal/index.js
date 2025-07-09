/**
 * PayPal payment processing for Cloudflare Functions
 */

// PayPal API Base URL - will be determined based on environment

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (pathname === '/' && request.method === 'GET') {
        return new Response(JSON.stringify({
          service: 'PayPal Payment Service',
          environment: env.PAYPAL_ENVIRONMENT || 'not set',
          endpoints: [
            'POST /create-order',
            'POST /capture-order',
            'POST /webhook'
          ],
          status: 'running'
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } else if (pathname === '/create-order' && request.method === 'POST') {
        return await createOrder(request, env, corsHeaders);
      } else if (pathname === '/capture-order' && request.method === 'POST') {
        return await captureOrder(request, env, corsHeaders);
      } else if (pathname === '/webhook' && request.method === 'POST') {
        return await handleWebhook(request, env, corsHeaders);
      } else {
        return new Response(JSON.stringify({
          error: 'Not Found',
          method: request.method,
          pathname: pathname,
          available_endpoints: [
            'GET /',
            'POST /create-order',
            'POST /capture-order',
            'POST /webhook'
          ]
        }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};

function getPayPalApiBase(env) {
  // Use production API for production environment, sandbox for development
  return env.PAYPAL_ENVIRONMENT === 'production' 
    ? 'https://api.paypal.com' 
    : 'https://api.sandbox.paypal.com';
}

async function getAccessToken(env) {
  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const apiBase = getPayPalApiBase(env);
  
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

async function createOrder(request, env, corsHeaders) {
  const { amount, currency = 'USD', description = 'Payment' } = await request.json();
  
  if (!amount) {
    return new Response(
      JSON.stringify({ error: 'Amount is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const accessToken = await getAccessToken(env);
  
  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toString()
      },
      description: description
    }]
  };

  const apiBase = getPayPalApiBase(env);
  const response = await fetch(`${apiBase}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  const order = await response.json();
  
  return new Response(
    JSON.stringify(order),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function captureOrder(request, env, corsHeaders) {
  const { orderID } = await request.json();
  
  if (!orderID) {
    return new Response(
      JSON.stringify({ error: 'Order ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const accessToken = await getAccessToken(env);
  
  const apiBase = getPayPalApiBase(env);
  const response = await fetch(`${apiBase}/v2/checkout/orders/${orderID}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const captureData = await response.json();
  
  return new Response(
    JSON.stringify(captureData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleWebhook(request, env, corsHeaders) {
  const payload = await request.text();
  const signature = request.headers.get('PAYPAL-TRANSMISSION-SIG');
  
  // Verify webhook signature (implement according to PayPal documentation)
  // This is a simplified version - implement proper signature verification
  
  const event = JSON.parse(payload);
  
  // Handle different webhook events
  switch (event.event_type) {
    case 'CHECKOUT.ORDER.APPROVED':
      console.log('Order approved:', event.resource);
      break;
    case 'PAYMENT.CAPTURE.COMPLETED':
      console.log('Payment captured:', event.resource);
      break;
    default:
      console.log('Unhandled event type:', event.event_type);
  }
  
  return new Response('OK', { headers: corsHeaders });
}