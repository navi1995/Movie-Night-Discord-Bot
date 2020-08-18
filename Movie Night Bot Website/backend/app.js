require('dotenv').config();
require('./strategies/discord');
const express = require('express');
const passport = require('passport');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors')
const Store = require('connect-mongo')(session);
const PORT = process.env.PORT || 3000;
const app = express();
const routes = require('./routes');

mongoose.connect(process.env.MONGO_LOGIN, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});

app.use(session({
	secret: process.env.SESSION_SECRET,
	cookie: {
		maxAge: 60000 * 60 * 24
	},
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
app.use(morgan('combined'));

app.get('/logout', function(request, response){
	console.log("logout");
	request.logout();
	response.redirect('http://localhost:3000');
});


app.use('/api', routes);
app.listen(PORT, () => console.log(`Running on port ${PORT}`));



