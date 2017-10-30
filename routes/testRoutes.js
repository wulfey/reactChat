const requireLogin = require("../middlewares/requireLogin");

module.exports = app => {
  app.get("/api", requireLogin, (req, res) => {
    console.log("welcome to the console");
    res.send({
      testLine: "Welcome to server 5000.",
      otherLine: "This is the testing output.",
      Login: "You must be logged in to see this ... in theory."
    });
  });
};
