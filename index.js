const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const googleKeys = require("./config/credentials.js");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");

let username = "";

const app = express();

app.use(passport.initialize());

passport.serializeUser((user, next) => {
  next(null, user);
});
passport.deserializeUser((obj, next) => {
  next(null, obj);
});

app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["123"]
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: googleKeys.googleAuthClientID,
      clientSecret: googleKeys.googleAuthClientSecret,
      callbackURL: "/auth/google/callback"
    },
    (token, refreshToken, profile, done) => {
      console.log(profile.displayName);
      return done(null, {
        profile: profile,
        token: token
      });
    }
  )
);

app.get("/", (req, res) => {
  if (req.session.token) {
    res.cookie("token", req.session.token);
    res.json({
      status: "session cookie set"
    });
    res.send(username);
  } else {
    res.cookie("token", "");
    res.json({
      status: "session cookie not set!!!"
    });
  }
  // res.json({
  //   status: "session cookie not set"
  // });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile"]
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/"
  }),
  (req, res) => {
    req.session.token = req.user.token;
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout();
  req.session = null;
  res.redirect("/");
});

const PORT = process.env.PORT || 9487;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
