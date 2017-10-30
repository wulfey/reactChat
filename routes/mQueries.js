// define inputs of {id, email, responded}

Survey.findOne({
  id: surveyId,
  recipients: {
    $elemMatch: {
      email: email,
      responded: false
    }
  }
});

// email = 'a@a.com';
// choice = 'yes || 'no';

Survey.updateOne(
  {
    _id: surveyId,
    recipients: {
      $elemMatch: {
        email: email,
        responded: false
      }
    }
  },
  {
    // $inc is INCREMEMNT
    // [choice] is evaluated by ES6, choice is passed in, then evaluated at run time
    $inc: { [choice]: 1 },
    // updates a property in the found survey from above
    // the subdocument collection should be recipients
    // the .$. matches the $elemMatch from above
    // set the responded property on the found thing as TRUE
    $set: { 'recipients.$.responded': true }
  }
);
