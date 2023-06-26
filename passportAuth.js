import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { User } from "./userModel.js";
import dotenv from "dotenv";
const result = dotenv.config();

// if (result.error) {
//   throw result.error;
// }
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      // callbackURL: "https://animex-a8i5.onrender.com/auth/google/callback",
      callbackURL: "/auth/google/callback"
      // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      // passReqToCallback:true
    },
    async function (accessToken, refreshToken, profile, cb) {
      // console.log(accessToken);
      // console.log(refreshToken);
      // console.log(profile.photos[0].value);
      await User.findOrCreate(
        {
          googleId: profile.id,
          username: profile.name.givenName,
          picture: profile.photos[0].value,
          email: profile.emails[0].value,
        },
        function (err, user) {
          // console.log("from google:",user);
          return cb(err, user);
        }
      );
    }
  )
);
