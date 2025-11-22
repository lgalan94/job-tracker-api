const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth/google/callback`,
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;

        // 1️⃣ Find user by Google ID
        let user = await User.findOne({ googleId: profile.id });

        // 2️⃣ If not found, try finding by email
        if (!user && email) {
          user = await User.findOne({ email });

          // Attach Google ID if user exists
          if (user) {
            user.googleId = profile.id;
            await user.save();
          }
        }

        // 3️⃣ Create new user if still not found
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            picture: profile.photos?.[0]?.value || null,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google login error:", error);
        return done(error, null);
      }
    }
  )
);

//GITHUB STRATEGY
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth/github/callback`,
      scope: ["user:email"],
    },
    async (_, __, profile, done) => {
      try {
        // Get email
        const email = profile.emails?.[0]?.value || null;

        // First try to find by GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        // If not found, try finding by email
        if (!user && email) {
          user = await User.findOne({ email });

          // If found by email, attach githubId
          if (user) {
            user.githubId = profile.id;
            await user.save();
          }
        }

        // If still no user, create a new one
        if (!user) {
          user = await User.create({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email,
            picture: profile.photos?.[0]?.value || null,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("GitHub login error:", error);
        return done(error, null);
      }
    }
  )
);

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;
