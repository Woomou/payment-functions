/**
 * Stripe payment processing for Cloudflare Functions
 */

const STRIPE_API_BASE = 'https://api.stripe.com';

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
      if (pathname === '/create-payment-intent' && request.method === 'POST') {
        return await createPaymentIntent(request, env, corsHeaders);
      } else if (pathname === '/confirm-payment' && request.method === 'POST') {
        return await confirmPayment(request, env, corsHeaders);
      } else if (pathname === '/webhook' && request.method === 'POST') {
        return await handleWebhook(request, env, corsHeaders);
      } else if (pathname === '/refund' && request.method === 'POST') {
        return await createRefund(request, env, corsHeaders);
      } else {
        return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};

async function stripeRequest(endpoint, method, data, env) {
  const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data ? new URLSearchParams(data).toString() : null,
  });

  return await response.json();
}

async function createPaymentIntent(request, env, corsHeaders) {
  const { amount, currency = 'usd', description = 'Payment', metadata = {} } = await request.json();
  
  if (!amount) {
    return new Response(
      JSON.stringify({ error: 'Amount is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const paymentIntentData = {
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    description,
    automatic_payment_methods: {
      enabled: true
    },
    metadata
  };

  const paymentIntent = await stripeRequest('/v1/payment_intents', 'POST', paymentIntentData, env);
  
  return new Response(
    JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function confirmPayment(request, env, corsHeaders) {
  const { paymentIntentId, paymentMethodId } = await request.json();
  
  if (!paymentIntentId) {
    return new Response(
      JSON.stringify({ error: 'Payment Intent ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const confirmData = {
    payment_method: paymentMethodId
  };

  const confirmedPayment = await stripeRequest(
    `/v1/payment_intents/${paymentIntentId}/confirm`, 
    'POST', 
    confirmData, 
    env
  );
  
  return new Response(
    JSON.stringify(confirmedPayment),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createRefund(request, env, corsHeaders) {
  const { chargeId, amount, reason = 'requested_by_customer' } = await request.json();
  
  if (!chargeId) {
    return new Response(
      JSON.stringify({ error: 'Charge ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const refundData = {
    charge: chargeId,
    reason
  };

  if (amount) {
    refundData.amount = Math.round(amount * 100); // Convert to cents
  }

  const refund = await stripeRequest('/v1/refunds', 'POST', refundData, env);
  
  return new Response(
    JSON.stringify(refund),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleWebhook(request, env, corsHeaders) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  // Verify webhook signature
  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  // In a real implementation, verify the webhook signature using Stripe's library
  // This is a simplified version
  
  const event = JSON.parse(payload);
  
  // Handle different webhook events
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object);
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;
    case 'charge.dispute.created':
      console.log('Dispute created:', event.data.object);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
  
  return new Response('OK', { headers: corsHeaders });
}