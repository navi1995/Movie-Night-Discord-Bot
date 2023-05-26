require('dotenv').config();
require('./strategies/discord');

const express = require('express');
// const path = require('path');
const passport = require('passport');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors')
const MongoStore = require('connect-mongo');
const PORT = process.env.PORT || 3000;
const app = express();
const routes = require('./routes');
const { getGuildCount } = require('./utils/api');

mongoose.connect(process.env.MONGO_LOGIN, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.use(session({
	secret: process.env.SESSION_SECRET,
	cookie: { maxAge: 60000 * 60 * 24 },
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({ mongoUrl: process.env.MONGO_LOGIN })
}));
app.use(cors({
	origin: ['*'],
	credentials: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(morgan('combined'));

app.get('/logout', function(request, response, next){
	request.logout(function(err) {
		if (err) return next(err);
		response.redirect(process.env.REACT_APP_BASE_URL);
	});
});

app.use('/api', routes);

app.get('/count', async function(req, resp) {
	const count = await getGuildCount();

	resp.send({count});
});

// app.use(express.static(path.join(__dirname, '..', process.env.WEB_FOLDER)));

// app.get('/*', function (req, res) {
// 	res.sendFile(path.join(__dirname, '..', process.env.WEB_FOLDER, 'index.html'));
// });
//Required for deployment to production
// app.use(express.static(path.join(__dirname)));

// app.get('/*', function (req, res) {
// 	console.log(path.join(__dirname, '..', process.env.WEB_FOLDER, 'index.html'));
// 	console.log(path.join(__dirname, '..', 'index.html'));
// 	res.sendFile(path.join(__dirname, 'index.html'));
// });

app.listen(PORT, () => {
	console.log(`Running on port ${PORT}`)
});