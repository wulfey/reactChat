const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');
const _ = require('lodash');
const Path = require('path-parser');
const { URL } = require('url');

//always import mongoose modeuls throguh the mongoose library outsid eof index.js
// this SURVEY model allows us to make mongoose queries that can be .exec() to MLAB
const Survey = mongoose.model('surveys');

module.exports = app => {
  app.get('/api/surveys', requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false
    });

    res.send(surveys);
  });

  //retun list of sruveys for current_user === req.user
  app.get('/api/surveys/:surveyId/:choice', async (req, res) => {
    res.send('Thanks for voting. Your input is appreciated.');
  });

  app.post('/api/surveys/webhooks', (req, res) => {
    // this is where the email results parsing occurs
    // req .body has the grand email results response pulsed from SG
    // const pattern = new Path('/api/surveys/:surveyId/:choice');
    // const events = _.map(req.body, event => {
    //   // event ... is a {} that has an email from SG
    //   // const pathname = new URL(event.url).pathname;
    //   // PATH can pull out :params out of URL objects, path-parser

    //   // what is test doing here?
    //   // test tests against a pattern defined by PATH from path-parser
    //   // p is our pattern, pathname is the result tested against p
    //   const match = pattern.test(new URL(event.url).pathname);
    //   // returns:
    //   // { surveyId: '59c2e1973008083529b2db60', choice: 'No' }
    //   // console.log(p.test(pathname));

    //   //longform logic
    //   // const pathname = new URL(event.url).pathname;
    //   // const p = new Path('/api/surveys/:surveyId/:choice');
    //   // const match = p.test(pathname);

    //   if (match) {
    //     return {
    //       email: event.email,
    //       surveyId: match.surveyId,
    //       choice: match.choice
    //     };
    //   }
    // });

    // const compactEvents = _.compact(events);
    // const uniqueEvents = _.uniqBy(compactEvents, 'email', 'surveyId');
    // could return unique Events using old syntax

    // chain is an advanced lodash JS ES6 power technique
    // chain is, uh, something alright, it may be very brittle
    const p = new Path('/api/surveys/:surveyId/:choice');
    const chainedEvents = _.chain(req.body)
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname);
        if (match) {
          return { email, surveyId: match.surveyId, choice: match.choice };
        }
      })
      .compact()
      .uniqBy('email', 'surveyId')
      .each(({ surveyId, email, choice }) => {
        if (choice === 'yes' || choice === 'Yes') {
          console.log(`incrementing yes:   ${choice}`);
          Survey.updateOne(
            {
              _id: surveyId,
              recipients: {
                $elemMatch: { email: email, responded: false }
              }
            },
            {
              $inc: { yes: 1 },
              $set: { 'recipients.$.responded': true },
              lastResponded: new Date()
            }
          ).exec();
        } else {
          console.log(`incrementing no:   ${choice}`);
          Survey.updateOne(
            {
              _id: surveyId,
              recipients: {
                $elemMatch: { email: email, responded: false }
              }
            },
            {
              $inc: { no: 1 },
              $set: { 'recipients.$.responded': true },
              lastResponded: new Date()
            }
          ).exec();
        }
      })
      .value();

    console.log(chainedEvents);

    res.send({});
  });

  //this isthe incoming post from the email response of a survey recipient
  //will be hard, has to webhook into platform
  // app.post('/api/surveys/webhooks');

  //this will create a new suvey from perspective of user
  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    //somehow persist this suvey and attached as user
    //USER has_many SURVEYS
    //  req should have:  title, subject, body, recipients in a comma separating STRING

    const { title, subject, body, recipients } = req.body;

    const survey = new Survey({
      title,
      body,
      subject,
      //   recipients: recipients.split(",").map(email => ({
      //     email
      //   })),
      recipients: recipients.split(',').map(email => ({ email: email.trim() })),
      //    req.user.id
      _user: req.user.id,
      dateSent: Date.now()
      //   lastResponded: Date
    });

    //try to send an email here?
    //how do you use a class to send an email?
    const mailer = new Mailer(survey, surveyTemplate(survey));
    console.log('----   Sending out an email.  ------');
    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      // don't want race condition that uses old, unupdated user below
      const user = await req.user.save();

      res.send(user);
    } catch (err) {
      // 422 says unprocessable request
      res.status(422).send(err);
    }
  });
};

// this is what is getting parsed

// [ {
// 	ip: '69.26.141.102',
// 	sg_event_id: 'YWM0NWYyOGItZWIzYy00ZTM4LWFhMmQtZDc4NGNjNmMwMzc3',
// 	sg_message_id: 'f3PdU8n4T6KN5oVQOwelug.filter0005p3las1-22749-59C2E198-2.0',
// 	useragent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36',
// 	event: 'click',
// 	url_offset: { index: 0, type: 'html' },
// 	email: 'jasonwolfe@gmail.com',
// 	timestamp: 1505944027,
// 	url: 'http://localhost:3000/api/surveys/59c2e1973008083529b2db60/Yes'
// } ]

// this is bad because we are doing all the query in node JS
// we need to be doing a smarter, email targeted query in MONGO
async function badWayOfUpdatingDBWithSurveyResponse(
  events,
  { surveyId, email, choice }
) {
  // this is very bad, it will pull the entirety of all responses on the survey object
  // and all the .recipients hanging on the survey
  let survey = await Survey.findByID(surveyId);

  // find a recipient htat matches email and has not responde dyet
  const responder = survey.recipients.find(
    recipient => recipient.email === email && !recipient.responded
  );
  if (!responder) {
    // recipient has already responsesd
    return console.log('Response already logged!');
  } else {
    // recipient hasn't responded, set their responded flag to true
    survey.recipients.id(respond._id).responded = true;
    survey[answer] += 1;
    survey.lastResponded = new Date(timestamp * 1000);

    // bad, this will save the entire recipients list off of survey again
    survey.save();
  }
}
