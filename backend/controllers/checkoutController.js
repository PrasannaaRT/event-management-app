const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Event = require('../models/Event');

exports.createCheckoutSession = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.isFree) {
      return res.status(400).json({ message: 'This is a free event.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: event.title,
              description: event.description,
            },
            unit_amount: event.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success`, // Simplified success URL
      cancel_url: `${process.env.FRONTEND_URL}/event/${eventId}`,
      metadata: {
        eventId: event.id,
        userId: userId,
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe session creation failed:', error);
    res.status(500).json({ message: 'Failed to create payment session' });
  }
};

// NEW FUNCTION to handle the webhook
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { eventId, userId } = session.metadata;

    try {
      // Fulfill the purchase: add the user to the event's attendees list
      await Event.findByIdAndUpdate(eventId, { $addToSet: { attendees: userId } });
      console.log(`Successfully registered user ${userId} for event ${eventId}`);
    } catch (err) {
      console.error('Error fulfilling purchase:', err);
    }
  }

  res.status(200).json({ received: true });
};