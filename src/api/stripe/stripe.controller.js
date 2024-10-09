require("dotenv").config(); // Ensure .env is loaded

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Initialize Stripe

const generateSecrete = async (req, res) => {
  console.log("req.body :>> ", req.body);

  try {
    const { amount, currency, description } = req.body;
    
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).send({
        error: {
          message: "Invalid amount. It must be a positive number.",
          status: false,
        },
      });
    }

    // Validate currency
    const validCurrencies = ["inr"]; // List of valid currencies
    if (!currency || !validCurrencies.includes(currency)) {
      return res.status(400).send({
        error: {
          message: "Invalid currency. Only 'inr' is accepted.",
          status: false,
        },
      });
    }

    // Validate description
    if (
      !description ||
      typeof description !== "string" ||
      description.trim() === ""
    ) {
      return res.status(400).send({
        error: {
          message: "Invalid description. It must be a non-empty string.",
          status: false,
        },
      });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in paise (smallest unit of INR, 1 INR = 100 paise)
      currency: currency, // Currency set to Indian Rupees (INR)
      automatic_payment_methods: { enabled: true },
      description: description,
    });

    console.log("paymentIntent :>> ", paymentIntent);

    res.send({
      clientSecret: paymentIntent.client_secret,
      nextAction: paymentIntent.next_action,
      status: true,
    });
  } catch (e) {
    console.error("Error creating PaymentIntent: ", e.message);
    res.status(400).send({
      error: {
        message: e.message,
        status: false,
      },
    });
  }
};

const completePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body; // Extract paymentIntentId from the request body
    console.log("req.body :>> ", req.body);
    if (!paymentIntentId) {
      return res.status(400).send({
        error: {
          message: "PaymentIntent ID is required",
          status: false,
        },
      });
    }

    // Retrieve the payment intent using Stripe's API
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Respond with the payment intent's status
    return res.status(200).send({
      status: true,
      message: "Payment status retrieved successfully",
      paymentIntentStatus: paymentIntent.status,
      paymentIntent,
    });
  } catch (error) {
    // Handle errors and send response
    return res.status(400).send({
      error: {
        message: error.message,
        status: false,
      },
    });
  }
};

module.exports = { generateSecrete, completePayment };
