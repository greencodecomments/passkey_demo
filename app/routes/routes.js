const express = require('express');
const router = express.Router();

//Passport
const PassportService = require('../services/passport-service');
const SessionChallengeStore = require('passport-fido2-webauthn').SessionChallengeStore

const passportService = new PassportService();
const sessionChallengeStore = new SessionChallengeStore();
passportService.init(sessionChallengeStore);

//Controllers
const pages = new (require('../controllers/pages'))();
const auth = new (require('../controllers/auth'))();
const admin = new (require('../controllers/admin'))();

router.get('/', pages.welcome, admin.dashboard);
router.get('/login', auth.login);
router.get('/register', auth.register);

router.post('/register/public-key/challenge', auth.createChallengeFrom(sessionChallengeStore));
router.post('/login/public-key', auth.passportCheck(), auth.admitUser, auth.denyUser);
router.post('/login/public-key/challenge', auth.getChallengeFrom(sessionChallengeStore));
router.post('/logout', auth.logout);

module.exports = router;