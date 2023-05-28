const router = require("express").Router();
const auth = require("./auth");
const discord = require("./discord");

// authentication middleware
const authenticate = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.status(401).send({ message: "Unauthorized" });
	}
};

router.use("/discord", authenticate, discord);
router.use("/auth", auth);

module.exports = router;
