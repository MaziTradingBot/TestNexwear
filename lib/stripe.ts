import Stripe from "stripe";

/**
 * Stripe server client. Only initialised when STRIPE_SECRET_KEY is set, so the
 * app keeps working in "simulation" mode until you add real keys.
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const stripeEnabled = !!stripe;
