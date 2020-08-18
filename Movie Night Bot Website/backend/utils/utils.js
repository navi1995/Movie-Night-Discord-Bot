const CryptoJS = require('crypto-js');

function encrypt(token) {
	return CryptoJS.AES.encrypt(token, process.env.SESSION_SECRET);
}

function decrypt(token) {
	return CryptoJS.AES.decrypt(token, process.env.SESSION_SECRET);
}

module.exports = { encrypt, decrypt };