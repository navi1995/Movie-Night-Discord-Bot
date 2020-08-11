const router = require('express').Router();
const auth = require('./auth');
const discord = require('./discord');

router.use("/discord", discord);
router.use("/auth", auth);

module.exports = router;