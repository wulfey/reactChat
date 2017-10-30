const keys = require("../config/keys");
const stripe = require("stripe")(keys.STRIPE_SECRET_KEY);
const requireLogin = require("../middlewares/requireLogin");

module.exports = app => {
  app.post("/api/stripepayment", requireLogin, async (req, res) => {
    // this lets you set a status that server can understand
    // this is the naive way, better to use middleware as above
    // if (!req.user) {
    //   res.status(401).send({ error: "you must log in" });
    // }
    const charge = await stripe.charges.create({
      amount: 500,
      currency: "usd",
      source: req.body.id, // obtained with Stripe.js
      description: "$5 for 5 credits"
    });

    //passport ties .user onto req
    req.user.credits += 5;
    // when you save something, you should copy the response
    // this ensures that user is always the freshest
    const user = await req.user.save();
    // responses to request are always:   res.send
    res.send(user);
  });
};
