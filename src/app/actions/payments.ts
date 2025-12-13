
'use server';

import { z } from 'zod';
import Stripe from 'stripe';
import coinbase from 'coinbase-commerce-node';

const CheckoutSchema = z.object({
  userId: z.string(),
  creatorId: z.string(),
  // Can be a tier name like 'Gold' or a specific content ID
  itemId: z.string(),
  amount: z.number().positive(),
  itemName: z.string(),
});

type CheckoutInput = z.infer<typeof CheckoutSchema>;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

coinbase.Client.init(process.env.COINBASE_API_KEY || '');
const { Charge } = coinbase.resources;

/**
 * Creates a real Stripe Checkout session.
 */
export async function createStripeCheckoutSession(input: CheckoutInput) {
  const validation = CheckoutSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'Invalid input.', redirectUrl: null };
  }
  const { userId, creatorId, itemId, amount, itemName } = validation.data;
  
  if (!process.env.STRIPE_SECRET_KEY) {
      return { success: false, error: 'Stripe is not configured.', redirectUrl: null };
  }

  const successUrl = `${process.env.NEXT_PUBLIC_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&method=stripe&creatorId=${creatorId}&tier=${itemId}`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_URL}/creators/${creatorId}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: itemName,
            },
            unit_amount: Math.round(amount * 100), // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        creatorId,
        itemId,
      }
    });

    return {
      success: true,
      error: null,
      redirectUrl: session.url,
    };
  } catch (error: any) {
    console.error("Stripe session creation failed:", error);
    return { success: false, error: error.message || "Could not create Stripe session.", redirectUrl: null };
  }
}

/**
 * Creates a real Coinbase Commerce charge.
 */
export async function createCoinbaseCharge(input: CheckoutInput) {
    const validation = CheckoutSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: 'Invalid input.', redirectUrl: null };
    }
    const { userId, creatorId, itemId, amount, itemName } = validation.data;

    if (!process.env.COINBASE_API_KEY) {
        return { success: false, error: 'Coinbase Commerce is not configured.', redirectUrl: null };
    }

    const redirectUrl = `${process.env.NEXT_PUBLIC_URL}/payment/success?method=coinbase&creatorId=${creatorId}&tier=${itemId}`;
  
    try {
        const charge = await Charge.create({
            name: itemName,
            description: `Subscription for ${itemName}`,
            local_price: {
                amount: amount.toString(),
                currency: 'USD',
            },
            pricing_type: 'fixed_price',
            metadata: {
                userId,
                creatorId,
                itemId
            },
            redirect_url: redirectUrl,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/creators/${creatorId}`,
        });

        return {
            success: true,
            error: null,
            redirectUrl: charge.hosted_url,
        };
    } catch (error: any) {
        console.error("Coinbase charge creation failed:", error);
        return { success: false, error: error.message || "Could not create Coinbase charge.", redirectUrl: null };
    }
}
