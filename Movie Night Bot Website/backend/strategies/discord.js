const passport = require('passport');
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
		callbackURL: process.env.DASHBOARD_CALLBACK_URL,
		scope: ['identify', 'guilds']
	}, async (accessToken, refreshToken, profile, done) => {
		const { id, username, discriminator, avatar, guilds } = profile		
		console.log(id, username, discriminator, avatar, guilds);
		
		try {
			const foundUser = await User.findOneAndUpdate({ discordID: id }, {
				discordTag: `${username}#${discriminator}`,
				avatar,
				guilds
			}, { new: true });

			if (foundUser) {
				return done(null, foundUser);
			} else {
				const newUser = await User.create({
					discordID: id,
					discordTag: `${username}#${discriminator}`,
					avatar,
					guilds
				});

				return done(null, newUser);
			}
		} catch (error) {
			return done(error, null);
		}
	})
)