require("dotenv").config();
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require("../models/user");
const router = express.Router();

let newUser = false;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://cas-clearance-server.vercel.app/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          let email = await User.findOne({ email: profile.emails[0].value });
          if (email) {
            user = await User.findOneAndUpdate(
              { email: profile.emails[0].value },
              {
                googleId: profile.id,
                displayName: profile.displayName,
                image: profile.photos[0].value,
              },
              { new: true }
            );
          } else {
            newUser = true;
            let role = "student";
            let unit = -1;

            if (
              process.env.ADMIN_EMAIL.split(",").includes(
                profile.emails[0].value
              )
            ) {
              role = "admin";
              unit = 8;
            }

            user = new User({
              googleId: profile.id,
              displayName: profile.displayName,
              email: profile.emails[0].value,
              image: profile.photos[0].value,
              role: role,
              unit: unit,
            });

            await user.save();
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "https://cas-clearance.vercel.app/login",
  }),
  (req, res) => {
    if (req.user.role === "student" && newUser) {
      res.redirect("https://cas-clearance.vercel.app/form");
    } else {
      res.redirect("https://cas-clearance.vercel.app");
    }
  }
);

router.get("/loggedin", async (req, res) => {
  if (req.user) {
    res.send({ success: true, user: req.user });
  } else {
    res.send({ success: false });
  }
});

router.get("/error", (req, res) => res.send("Error logging in via Google.."));

router.get("/signout", (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log("session destroyed.");
    });
    res.send({ success: true });
  } catch (err) {
    res
      .status(400)
      .send({ message: "Failed to sign out user", success: false });
  }
});

module.exports = router;
