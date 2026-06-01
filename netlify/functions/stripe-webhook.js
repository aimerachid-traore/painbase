// ================================================================
//  Netlify Function : stripe-webhook
//  Reçoit les événements Stripe et met à jour le plan utilisateur
//
//  Variables Netlify requises :
//    STRIPE_SECRET_KEY      → Stripe → Developers → API keys
//    STRIPE_WEBHOOK_SECRET  → Stripe → Developers → Webhooks → Signing secret
//    SUPABASE_URL           → déjà configuré
//    SUPABASE_SERVICE_KEY   → Supabase → Settings → API → service_role
// ================================================================
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  switch (stripeEvent.type) {

    case 'checkout.session.completed': {
      const session = stripeEvent.data.object;
      const { email, plan } = session.metadata || {};
      if (email && plan) {
        await sb.from('profiles').update({ plan }).eq('email', email);
        console.log(`✓ Plan ${plan} activé pour ${email}`);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      // Abonnement annulé → repasse en free
      const sub = stripeEvent.data.object;
      const customer = await stripe.customers.retrieve(sub.customer);
      if (customer.email) {
        await sb.from('profiles').update({ plan: 'free' }).eq('email', customer.email);
        console.log(`↩ Plan annulé pour ${customer.email} → free`);
      }
      break;
    }

    case 'invoice.payment_failed': {
      // Paiement échoué → log, pas d'action immédiate
      console.warn('Payment failed:', stripeEvent.data.object.customer_email);
      break;
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
