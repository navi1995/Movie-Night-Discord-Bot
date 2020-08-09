const router = require('express').Router();
const passport = require('passport');

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/redirect', passport.authenticate('discord'), (request, response) => {
	response.redirect('http://localhost:3000/dashboard')
});

router.get('/', (request, response) => {
	if (request.user) {
		response.send(request.user);
	} else {
		response.status(401).send({ message: "Unauthorized" });
	}
});

module.exports = router;