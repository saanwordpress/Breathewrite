import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummyKey1234567890', {
  apiVersion: '2026-06-24.dahlia', // Latest API version
  appInfo: {
    name: 'Breathe Write',
    version: '1.0.0',
  },
})
