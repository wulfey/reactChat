const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
// const requireCredits = require("../middlewares/requireCredits");

//always import mongoose modeuls throguh the mongoose library outsid eof index.js
const Market = mongoose.model('markets');
const bittrex = require('node.bittrex.api');

module.exports = app => {
  //calls standard bittrex api query
  app.get('/api/markets', requireLogin, async (req, res) => {
    bittrex.getmarketsummaries(function(data, err) {
      if (err) {
        return console.error(err);
      }
      // this pipes the results into the queryResults redux store, this is on the prop in 3000
      res.send(data.result);
    });
  });

  //retun list of sruveys for current_user === req.user
  app.post('/api/markets', async (req, res) => {
    console.log('in 5000 ------ this is req:');
    console.log(req);
    // const data = req.body
    // const { title, subject, body, recipients } = req.body;

    //     const survey = new Survey({
    //       title,
    //       body,
    //       subject,
    //       //   recipients: recipients.split(",").map(email => ({
    //       //     email
    //       //   })),
    //       recipients: recipients.split(',').map(email => ({ email: email.trim() })),
    //       //    req.user.id
    //       _user: req.user.id,
    //       dateSent: Date.now()
    //       //   lastResponded: Date
    //     });

    //     //try to send an email here?
    //     //how do you use a class to send an email?
    //     const mailer = new Mailer(survey, surveyTemplate(survey));
    //     console.log('----   Sending out an email.  ------');
    //     try {
    //       await mailer.send();
    //       await survey.save();
    //       req.user.credits -= 1;
    //       // don't want race condition that uses old, unupdated user below
    //       const user = await req.user.save();

    //       res.send(user);
    //     } catch (err) {
    //       // 422 says unprocessable request
    //       res.status(422).send(err);
    //     }
    //   });
  });

  //   //this isthe incoming post from the email response of a survey recipient
  //   //will be hard, has to webhook into platform
  //   app.post("/api/surveys/webhooks");

  //   //this will create a new suvey from perspective of user
  //   app.post("/api/surveys", requireLogin, requireCredits, (req, res) => {
  //     //somehow persist this suvey and attached as user
  //     //USER has_many SURVEYS
  //     //  req should have:  title, subject, body, recipients in a comma separating STRING

  //     const { title, subject, body, recipients } = req.body;

  //     const survey = new Survey({
  //       title,
  //       body,
  //       subject,
  //       //   recipients: recipients.split(",").map(email => ({
  //       //     email
  //       //   })),
  //       recipients: recipients.split(",").map(email => ({ email: email.trim() })),
  //       //    req.user.id
  //       _user: req.user.id,
  //       dateSent: Date.now()
  //       //   lastResponded: Date
  //     });
  //   });
};
