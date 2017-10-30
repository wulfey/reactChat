const passport = require("passport");

module.exports = app => {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });
};

// const passport = require("passport");
// // const keys = require("../config/keys");

// module.exports = app => {
//   app.get(
//     "/auth/google",
//     passport.authenticate("google", { scope: ["profile", "email"] })
//   );

//   app.get(
//     "/auth/google/callback",
//     passport.authenticate("google"),
//     (req, res) => {
//       res.redirect("/surveys");
//     }
//   );

//   app.get("/api/logout", (req, res) => {
//     req.logout();
//     // res.send(req.user);
//     res.redirect("/");
//   });

//   app.get("/api/current_user", (req, res) => {
//     res.send(req.user);
//   });

//   // app.get("/", (req, res) => {
//   //   console.log("welcome to the console");
//   //   res.send({
//   //     hi: "there, a fourth version, to get MLAB to work",
//   //     GOOGLE_CLIENT_ID: keys.GOOGLE_CLIENT_ID,
//   //     GOOGLE_CLIENT_SECRET: keys.GOOGLE_CLIENT_SECRET,
//   //     MONGO_URI: keys.MONGO_URI,
//   //     COOKIE_KEY: keys.COOKIE_KEY
//   //   });
//   // });

//   // app.get('/greet', (req, res) => {
//   //   res.send({ hi: 'greeetssss' });
//   // });

//   // app - the express app to register
//   // get - watch for HTTP request on GET method
//   // '/' - watch for '/' ROUTE access on the GET rest call
//   // req - fucntion attrtibute for the incoming
//   // res - funciton objet for outgoing
//   // res.send - return on the incoming res object
// };
