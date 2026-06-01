// ================================================================
//  Netlify Function : create-checkout
//  Crée une session Stripe Checkout et retourne l'URL de paiement
//
//  Variables Netlify requises :
//    STRIPE_SECRET_KEY  → Stripe Dashboard → Developers → API keys → Secret key
//    URL                → automatiquement défini par Netlify (ex: https://painbase.netlify.app)
// ================================================================
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// IDs des prix Stripe — à créer dans Stripe Dashboard → Products
// puis remplacer ces valeurs par tes vrais price IDs (price_xxx)
const PRICE_IDS = {
  pro_monthly:     process.env.STRIPE_PRICE_PRO_MONTHLY     || 'price_pro_monthly',
  pro_annual:      process.env.STRIPE_PRICE_PRO_ANNUAL      || 'price_pro_annual',
  builder_monthly: process.env.STRIPE_PRICE_BUILDER_MONTHLY || 'price_builder_monthly',
  builder_annual:  process.env.STRIPE_PRICE_BUILDER_ANNUAL  || 'price_builder_annual',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let plan, email, billing;
  try {
    ({ plan, email, billing } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const priceKey = `${plan}_${billing || 'monthly'}`;
  const priceId  = PRICE_IDS[priceKey];

  if (!priceId || priceId.startsWith('price_pro') || priceId.startsWith('price_builder')) {
    // Prix Stripe pas encore configurés → redirige vers une page d'attente
    return {
      statusCode: 200,
      body: JSON.stringify({
        url: `${process.env.URL || ''}/painbase-pricing.html?waitlist=true&plan=${plan}&email=${encodeURIComponent(email)}`
      })
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer_email: email,
      success_url: `${process.env.URL}/painbase-dashboard.html?success=true&plan=${plan}`,
      cancel_url:   `${process.env.URL}/painbase-pricing.html`,
      metadata:     { plan, email },
      allow_promotion_codes: true,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
