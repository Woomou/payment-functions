/**
 * PayPal comprehensive payment processing for Cloudflare Functions
 * Includes order tracking, payment tracking, and webhook handling
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, PayPal-Request-Id',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (pathname === '/' && request.method === 'GET') {
        return new Response(JSON.stringify({
          service: 'PayPal Payment Service - All-in-One',
          environment: env.PAYPAL_ENVIRONMENT || 'not set',
          endpoints: [
            'POST /create-order',
            'POST /capture-order',
            'GET /orders/{order_id}',
            'GET /orders/{order_id}/track',
            'POST /orders/{order_id}/track',
            'PUT /orders/{order_id}/track',
            'GET /payments/{payment_id}',
            'POST /payments/{payment_id}/refund',
            'POST /webhook',
            'POST /webhook/verify'
          ],
          features: [
            'Order Creation & Capture',
            'Real-time Order Tracking',
            'Payment Status Monitoring',
            'Refund Processing',
            'Webhook Event Handling',
            'Shipment Tracking Integration'
          ],
          status: 'running'
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } else if (pathname === '/create-order' && request.method === 'POST') {
        return await createOrder(request, env, corsHeaders);
      } else if (pathname === '/capture-order' && request.method === 'POST') {
        return await captureOrder(request, env, corsHeaders);
      } else if (pathname.startsWith('/orders/') && pathname.endsWith('/track') && request.method === 'GET') {
        const orderId = pathname.split('/')[2];
        return await getOrderTracking(orderId, env, corsHeaders);
      } else if (pathname.startsWith('/orders/') && pathname.endsWith('/track') && request.method === 'POST') {
        const orderId = pathname.split('/')[2];
        return await addOrderTracking(orderId, request, env, corsHeaders);
      } else if (pathname.startsWith('/orders/') && pathname.endsWith('/track') && request.method === 'PUT') {
        const orderId = pathname.split('/')[2];
        return await updateOrderTracking(orderId, request, env, corsHeaders);
      } else if (pathname.startsWith('/orders/') && request.method === 'GET') {
        const orderId = pathname.split('/')[2];
        return await getOrderDetails(orderId, env, corsHeaders);
      } else if (pathname.startsWith('/payments/') && pathname.endsWith('/refund') && request.method === 'POST') {
        const paymentId = pathname.split('/')[2];
        return await refundPayment(paymentId, request, env, corsHeaders);
      } else if (pathname.startsWith('/payments/') && request.method === 'GET') {
        const paymentId = pathname.split('/')[2];
        return await getPaymentDetails(paymentId, env, corsHeaders);
      } else if (pathname === '/webhook' && request.method === 'POST') {
        return await handleWebhook(request, env, corsHeaders);
      } else if (pathname === '/webhook/verify' && request.method === 'POST') {
        return await verifyWebhook(request, env, corsHeaders);
      } else {
        return new Response(JSON.stringify({
          error: 'Not Found',
          method: request.method,
          pathname: pathname,
          available_endpoints: [
            'GET /',
            'POST /create-order',
            'POST /capture-order',
            'GET /orders/{order_id}',
            'GET /orders/{order_id}/track',
            'POST /orders/{order_id}/track',
            'PUT /orders/{order_id}/track',
            'GET /payments/{payment_id}',
            'POST /payments/{payment_id}/refund',
            'POST /webhook',
            'POST /webhook/verify'
          ]
        }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          details: error.message,
          timestamp: new Date().toISOString()
        }),
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
  const { 
    amount, 
    currency = 'USD', 
    description = 'Payment',
    reference_id,
    custom_id,
    invoice_id,
    soft_descriptor,
    items = [],
    shipping = {},
    application_context = {}
  } = await request.json();
  
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
      reference_id: reference_id || `order_${Date.now()}`,
      custom_id: custom_id,
      invoice_id: invoice_id,
      soft_descriptor: soft_descriptor,
      amount: {
        currency_code: currency,
        value: amount.toString(),
        breakdown: items.length > 0 ? {
          item_total: {
            currency_code: currency,
            value: items.reduce((sum, item) => sum + (item.unit_amount.value * item.quantity), 0).toString()
          }
        } : undefined
      },
      items: items.length > 0 ? items : undefined,
      shipping: Object.keys(shipping).length > 0 ? shipping : undefined,
      description: description
    }],
    application_context: {
      brand_name: application_context.brand_name || 'Your Store',
      landing_page: application_context.landing_page || 'NO_PREFERENCE',
      user_action: application_context.user_action || 'PAY_NOW',
      return_url: application_context.return_url,
      cancel_url: application_context.cancel_url
    }
  };

  const apiBase = getPayPalApiBase(env);
  const response = await fetch(`${apiBase}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    body: JSON.stringify(orderData),
  });

  const order = await response.json();
  
  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to create order', details: order }),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
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

async function getOrderDetails(orderId, env, corsHeaders) {
  const accessToken = await getAccessToken(env);
  const apiBase = getPayPalApiBase(env);
  
  const response = await fetch(`${apiBase}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const order = await response.json();
  
  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to get order details', details: order }),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify(order),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getOrderTracking(orderId, env, corsHeaders) {
  const accessToken = await getAccessToken(env);
  const apiBase = getPayPalApiBase(env);
  
  const response = await fetch(`${apiBase}/v1/shipping/trackers-batch/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const tracking = await response.json();
  
  return new Response(
    JSON.stringify(tracking),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function addOrderTracking(orderId, request, env, corsHeaders) {
  const { 
    tracking_number, 
    carrier, 
    tracking_url,
    notify_buyer = true,
    items = []
  } = await request.json();
  
  if (!tracking_number || !carrier) {
    return new Response(
      JSON.stringify({ error: 'Tracking number and carrier are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const accessToken = await getAccessToken(env);
  const apiBase = getPayPalApiBase(env);
  
  const trackingData = {
    trackers: [{
      transaction_id: orderId,
      tracking_number: tracking_number,
      status: 'SHIPPED',
      carrier: carrier.toUpperCase(),
      tracking_url: tracking_url,
      notify_buyer: notify_buyer,
      items: items
    }]
  };

  const response = await fetch(`${apiBase}/v1/shipping/trackers-batch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trackingData),
  });

  const result = await response.json();
  
  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateOrderTracking(orderId, request, env, corsHeaders) {
  const { 
    tracking_number, 
    carrier, 
    status = 'SHIPPED',
    tracking_url,
    notify_buyer = true 
  } = await request.json();
  
  if (!tracking_number || !carrier) {
    return new Response(
      JSON.stringify({ error: 'Tracking number and carrier are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const accessToken = await getAccessToken(env);
  const apiBase = getPayPalApiBase(env);
  
  const trackingData = {
    transaction_id: orderId,
    tracking_number: tracking_number,
    status: status,
    carrier: carrier.toUpperCase(),
    tracking_url: tracking_url,
    notify_buyer: notify_buyer
  };

  const response = await fetch(`${apiBase}/v1/shipping/trackers/${orderId}-${tracking_number}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trackingData),
  });

  const result = await response.json();
  
  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getPaymentDetails(paymentId, env, corsHeaders) {
  const accessToken = await getAccessToken(env);
  const apiBase = getPayPalApiBase(env);
  
  const response = await fetch(`${apiBase}/v2/payments/captures/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const payment = await response.json();
  
  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to get payment details', details: payment }),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify(payment),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function refundPayment(paymentId, request, env, corsHeaders) {
  const { 
    amount, 
    currency = 'USD', 
    note_to_payer, 
    invoice_id 
  } = await request.json();
  
  const accessToken = await getAccessToken(env);
  const apiBase = getPayPalApiBase(env);
  
  const refundData = {
    amount: amount ? {
      currency_code: currency,
      value: amount.toString()
    } : undefined,
    note_to_payer: note_to_payer,
    invoice_id: invoice_id
  };

  const response = await fetch(`${apiBase}/v2/payments/captures/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    body: JSON.stringify(refundData),
  });

  const refund = await response.json();
  
  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to process refund', details: refund }),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify(refund),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function verifyWebhook(request, env, corsHeaders) {
  const {
    auth_algo,
    cert_id,
    transmission_id,
    transmission_sig,
    transmission_time,
    webhook_id,
    webhook_event
  } = await request.json();
  
  const accessToken = await getAccessToken(env);
  const apiBase = getPayPalApiBase(env);
  
  const verificationData = {
    auth_algo: auth_algo,
    cert_id: cert_id,
    transmission_id: transmission_id,
    transmission_sig: transmission_sig,
    transmission_time: transmission_time,
    webhook_id: webhook_id,
    webhook_event: webhook_event
  };

  const response = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verificationData),
  });

  const verification = await response.json();
  
  return new Response(
    JSON.stringify(verification),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleWebhook(request, env, corsHeaders) {
  const payload = await request.text();
  const headers = request.headers;
  
  // Extract webhook headers for verification
  const webhookHeaders = {
    'PAYPAL-TRANSMISSION-ID': headers.get('PAYPAL-TRANSMISSION-ID'),
    'PAYPAL-CERT-ID': headers.get('PAYPAL-CERT-ID'),
    'PAYPAL-AUTH-ALGO': headers.get('PAYPAL-AUTH-ALGO'),
    'PAYPAL-TRANSMISSION-SIG': headers.get('PAYPAL-TRANSMISSION-SIG'),
    'PAYPAL-TRANSMISSION-TIME': headers.get('PAYPAL-TRANSMISSION-TIME')
  };
  
  const event = JSON.parse(payload);
  
  // Log webhook event for debugging
  console.log('Webhook received:', {
    event_type: event.event_type,
    resource_type: event.resource_type,
    summary: event.summary,
    resource: event.resource,
    headers: webhookHeaders
  });
  
  // Handle different webhook events
  switch (event.event_type) {
    case 'CHECKOUT.ORDER.APPROVED':
      console.log('Order approved:', event.resource);
      await handleOrderApproved(event.resource, env);
      break;
    case 'CHECKOUT.ORDER.COMPLETED':
      console.log('Order completed:', event.resource);
      await handleOrderCompleted(event.resource, env);
      break;
    case 'PAYMENT.CAPTURE.COMPLETED':
      console.log('Payment captured:', event.resource);
      await handlePaymentCaptured(event.resource, env);
      break;
    case 'PAYMENT.CAPTURE.DENIED':
      console.log('Payment denied:', event.resource);
      await handlePaymentDenied(event.resource, env);
      break;
    case 'PAYMENT.CAPTURE.PENDING':
      console.log('Payment pending:', event.resource);
      await handlePaymentPending(event.resource, env);
      break;
    case 'PAYMENT.CAPTURE.REFUNDED':
      console.log('Payment refunded:', event.resource);
      await handlePaymentRefunded(event.resource, env);
      break;
    case 'PAYMENT.SALE.COMPLETED':
      console.log('Sale completed:', event.resource);
      await handleSaleCompleted(event.resource, env);
      break;
    case 'PAYMENT.SALE.DENIED':
      console.log('Sale denied:', event.resource);
      await handleSaleDenied(event.resource, env);
      break;
    case 'PAYMENT.SALE.PENDING':
      console.log('Sale pending:', event.resource);
      await handleSalePending(event.resource, env);
      break;
    case 'PAYMENT.SALE.REFUNDED':
      console.log('Sale refunded:', event.resource);
      await handleSaleRefunded(event.resource, env);
      break;
    case 'PAYMENT.SALE.REVERSED':
      console.log('Sale reversed:', event.resource);
      await handleSaleReversed(event.resource, env);
      break;
    case 'CUSTOMER.DISPUTE.CREATED':
      console.log('Dispute created:', event.resource);
      await handleDisputeCreated(event.resource, env);
      break;
    case 'RISK.DISPUTE.CREATED':
      console.log('Risk dispute created:', event.resource);
      await handleRiskDisputeCreated(event.resource, env);
      break;
    default:
      console.log('Unhandled event type:', event.event_type);
  }
  
  return new Response('OK', { headers: corsHeaders });
}

// Webhook event handlers
async function handleOrderApproved(resource, env) {
  // Implement your order approved logic here
  // e.g., update database, send notifications, etc.
}

async function handleOrderCompleted(resource, env) {
  // Implement your order completed logic here
}

async function handlePaymentCaptured(resource, env) {
  // Implement your payment captured logic here
}

async function handlePaymentDenied(resource, env) {
  // Implement your payment denied logic here
}

async function handlePaymentPending(resource, env) {
  // Implement your payment pending logic here
}

async function handlePaymentRefunded(resource, env) {
  // Implement your payment refunded logic here
}

async function handleSaleCompleted(resource, env) {
  // Implement your sale completed logic here
}

async function handleSaleDenied(resource, env) {
  // Implement your sale denied logic here
}

async function handleSalePending(resource, env) {
  // Implement your sale pending logic here
}

async function handleSaleRefunded(resource, env) {
  // Implement your sale refunded logic here
}

async function handleSaleReversed(resource, env) {
  // Implement your sale reversed logic here
}

async function handleDisputeCreated(resource, env) {
  // Implement your dispute created logic here
}

async function handleRiskDisputeCreated(resource, env) {
  // Implement your risk dispute created logic here
}