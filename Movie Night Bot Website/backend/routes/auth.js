const router = require('express').Router();
const passport = require('passport');

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/redirect', passport.authenticate('discord'), (request, response) => {
	response.sendStatus(200);
});

router.get('/', (request, response) => {
	if (request.user) {
		console.log("yes");
		response.send(request.user);
	} else {
		console.log("no");
		response.status(401).send({ message: "Unauthorized" });
	}
});

module.exports = router;