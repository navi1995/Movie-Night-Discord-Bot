const passport = require('passport');
const { encrypt } = require('../utils/utils');
const DiscordStrategy = require('passport-discord');
const User = require('../database/schemas/User');

passport.serializeUser((user, done) => {
	done(null, user.discordID);
});

passport.deserializeUser(async (discordID, done) => {
	try {
		const user = await User.findOne({discordID });
		return user ? done(null, user) : done(null, null);
	} catch (err) {
		done(err, null);
	}
});

passport.use(
	new DiscordStrategy({
		clientID: process.env.DASHBOARD_CLIENT_ID,
		clientSecret: process.env.DASHBOARD_CLIENT_SECRET,
		callbackURL: process.env.BASE_URL + process.env.DASHBOARD_CALLBACK_URL.substring(1),
		scope: ['identify', 'guilds']
	}, async (accessToken, refreshToken, profile, done) => {
		const { id, username, discriminator, avatar, guilds } = profile;
		
		try {
			const foundUser = await User.findOneAndUpdate({ discordID: id }, {
				discordTag: `${username}#${discriminator}`,
				avatar,
				guilds,
				accessToken: encrypt(accessToken).toString(),
				refreshToken: encrypt(refreshToken).toString()
			}, { upsert: true, new: true });

			if (foundUser) {
				return done(null, foundUser);
			} else {
				throw 'Something went wrong.'; 
			}
		} catch (error) {
			return done(error, null);
		}
	})
)