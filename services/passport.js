const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys');
const mongoose = require('mongoose');

// 1 argument means look up a model with this name (note no schmea provided)
const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
  // this user.id is a shortcut to the MONGOLABs __id
  // this is not googleId
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.GOOGLE_CLIENT_ID,
      clientSecret: keys.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    // function(accessToken, refreshToken, profile, done) {
    //   User.findOne({ googleId: profile.id }).then(existingUser => {
    //     if (existingUser) {
    //       return done(null, existingUser);
    //     }

    //     const user = new User({ googleId: profile.id }).save();

    //     done(null, user);
    //   });
    // }
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }

      const user = await new User({ googleId: profile.id }).save();
      done(null, user);
    }
  )
);
// User.findOne({ googleId: profile.id }).then(existingUser => {
//   if (existingUser) {
//     // we already have a record with the given profile ID
//     done(null, existingUser);
//   } else {
//     // we don't have a user record with this ID, make a new record!
//     new User({ googleId: profile.id })
//       .save()
//       .then(user => done(null, user));
//   }
// });

// import express from 'express';
// on SERVER side, you have to use COMMONJS modules
// NODE Is dumb, can't understand IMPORT

// passport.use
// this is way of saying 'use this strategy'

//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }

// console.log("accessToken", accessToken), //accesstoken lets the APP call to Google for user data
//   console.log("refreshToken", refreshToken), //allows access token to refresh
//   console.log("profile", profile), //identifying info on user account
//   console.log("done", done);
