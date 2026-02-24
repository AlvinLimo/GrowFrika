// backend/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists with this Google ID
                let user = await User.findOne({ 
                    where: { googleId: profile.id } 
                });

                if (user) {
                    // Update profile picture if changed
                    if (profile.photos && profile.photos[0].value !== user.profilePicture) {
                        await user.update({ 
                            profilePicture: profile.photos[0].value 
                        });
                    }
                    return done(null, user);
                }

                // Check if user exists with this email
                const email = profile.emails?.[0]?.value;
                if (email) {
                    user = await User.findOne({ where: { email } });
                    
                    if (user) {
                        // Link Google account to existing email account
                        await user.update({ 
                            googleId: profile.id,
                            isGoogleUser: true,
                            isVerified: true, // Google accounts are pre-verified
                            profilePicture: profile.photos?.[0]?.value
                        });
                        return done(null, user);
                    }
                }

                // Create new user
                const newUser = await User.create({
                    email: email!,
                    username: profile.displayName || email!.split('@')[0],
                    googleId: profile.id,
                    isGoogleUser: true,
                    hasPassword: false,
                    isVerified: true, // Google accounts are pre-verified
                    profilePicture: profile.photos?.[0]?.value || ""
                });

                done(null, newUser);
            } catch (error) {
                done(error as Error);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;