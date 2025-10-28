import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: '/api/auth/google/callback', // Setup in the Google cloud Developer Console
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // First, see if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user); // Found, so logging them in
          }

          // If not found by Google ID, check if a user exists with the same email
          // to prevent duplicate accounts
          user = await User.findOne({ email: profile._json.email });

          if (user) {
            // Linking the the Google ID to the existing email account if email is found (QOL)
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          // If no user exists, create a new one
          const newUser = await User.create({
            googleId: profile.id,
            email: profile._json.email,
            role: 'Standard',   // Remember, all new signups get 'Standard' role... might change logic later if OAuth login
                                // is from a special place, like Neuralink
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};

export default configurePassport;