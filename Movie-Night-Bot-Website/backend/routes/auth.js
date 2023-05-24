const router = require('express').Router();
const passport = require('passport');

require('dotenv').config();

router.get('/discord', passport.authenticate('discord'));

//Failure redirect will send back to our homepage if user clicks cancel.
router.get('/discord/redirect', passport.authenticate('discord', { failureRedirect: process.env.REACT_APP_BASE_URL || '/' }), (request, response) => {
	response.redirect(`${process.env.REACT_APP_BASE_URL}menu`)
});

router.get('/', (request, response) => {
	if (request.user) {
		response.send(request.user);
	} else {
		response.status(401).send({ message: 'Unauthorized' });
	}
});

module.exports = router;