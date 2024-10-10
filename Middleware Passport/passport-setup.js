const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../../models/User'); // Assure-toi que ce chemin est correct

// Configuration de la stratégie Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Vérifie si l'utilisateur existe déjà dans ta base de données
    let user = await User.findOne({ where: { googleId: profile.id } });
    if (user) {
      done(null, user);
    } else {
      // Sinon, crée un nouvel utilisateur
      user = await User.create({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
      });
      done(null, user);
    }
  } catch (error) {
    console.error('Error in Google Strategy:', error);
    done(error, null);
  }
}));

// Configuration de la stratégie Facebook
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails'], // Demande le champ email
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { facebookId: profile.id } });
    if (user) {
      done(null, user);
    } else {
      user = await User.create({
        facebookId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
      });
      done(null, user);
    }
  } catch (error) {
    console.error('Error in Facebook Strategy:', error);
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id); // Change selon ton ORM
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});