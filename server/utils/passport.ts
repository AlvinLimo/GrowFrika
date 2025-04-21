import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import  User from '../models/User';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,   
        },
        async(accessToken, refreshToken, profile, done) => {
            try{
                const existingUser = await User.findOne({ where: { email: profile.emails![0].value } });
                if(existingUser){
                    return done(null, existingUser);
                }

                const newUser = await User.create({
                    id: uuidv4(),
                    username: profile.displayName,
                    email: profile.emails?.[0].value || '',
                    googleId: profile.id
                })
                done (null, newUser);
            }catch(err){
                console.error(err);
                done(err, false);
            }
        }
    )
)

export default passport