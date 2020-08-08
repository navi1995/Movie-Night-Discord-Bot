const router = require('express').Router();

router.get('/', (request, response) => {
	response.sendStatus(200);
});

module.exports = router;