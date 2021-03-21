require('dotenv').config();
require('./strategies/discord');

const express = require('express');
const path = require('path');
const passport = require('passport');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors')
const Store = require('connect-mongo')(session);
const PORT = process.env.PORT || 3000;
const app = express();
const routes = require('./routes');
const { getGuildCount } = require('./utils/api');

mongoose.connect(process.env.MONGO_LOGIN, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});

app.use(session({
	secret: process.env.SESSION_SECRET,
	cookie: { maxAge: 60000 * 60 * 24 },
	resave: false,
	saveUninitialized: false,
	store: new Store({ mongooseConnection: mongoose.connection })
}));
app.use(cors({
	origin: ['http://localhost:3000'],
	credentials: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(morgan('combined'));

app.get('/logout', function(request, response){
	console.log('logout');
	request.logout();
	response.redirect(process.env.BASE_URL);
});

app.use('/api', routes);

app.get('/count', async function(req, resp) {
	const count = await getGuildCount();

	resp.send({count});
});

//Required for deployment to production
app.use(express.static(path.join(__dirname, '..', process.env.WEB_FOLDER)));

app.get('/*', function (req, res) {
	console.log("sendfile");
	res.sendFile(path.join(__dirname, '..', process.env.WEB_FOLDER, 'index.html'));
});

app.listen(PORT, () => {
	console.log(process.env);
	console.log(`Running on port ${PORT}`)
});