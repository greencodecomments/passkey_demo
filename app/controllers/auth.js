const { v4: UUID } = require('uuid');
const passport = require('passport');
const base64url = require('base64url');
const models = require('../models'); // Adjust the path as necessary

class AuthController {
    passportCheckDebug(req, res, next) {  //doesn't forward to the next middleware (but does give a console log)
        passport.authenticate('webauthn', {
            failureMessage: true,
            failWithError: true
        }, function (error, user, info) {
            // this will execute in any case, even if a passport strategy will find an error
            // log everything to console
            console.log("AuthController:passportCheck():authenticate - error", error);
            console.log("AuthController:passportCheck():authenticate - user", user);
            console.log("AuthController:passportCheck():authenticate - info", info);
            if (!user) {
                // If no user is found, pass the error to the next middleware
                res.status(401).json({
                    ok: false,
                    message: info.message || 'Authentication failed'
                });
            }
            req.user = user; // Doesn't seem to populating req.user 
            return next();
        })(req, res, next);
    }
    passportCheck() {
        return passport.authenticate('webauthn', {
            failureMessage: true,
            failWithError: true
        });
    }

    admitUser(req, res, next) {
        console.log("AuthController:admitUser -", req.user, req.body);
        res.json({
            ok: true,
            destination: '/'
        });
    }

    denyUser(err, req, res, next) {
        console.log("AuthController:denyUser -", err, req.user, req.body);
        const cxx = Math.floor(err.statusCode / 100);
        if (cxx != 4) {  
            return next(err);
        }

        //4xx error
        res.json({
            ok: false,
            destination: '/login'
        });
    }

    register(req, res, next) {
        //if (!req.user) {
            return res.render('auth/register');
        //}
        //next();
    }
    login(req, res, next) {
        //if (!req.user) {
            return res.render('auth/login');
        //}
        //next();
    }

    logout(req, res, next) {
        console.log("AuthController:logout -", req.user);
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    }
    createChallengeFrom(store) {
        return async (req, res, next) => {
            console.log("AuthController:createChallengeFrom:store -", store);
            const existingUser = await models.user.findOne({
                where: { email: req.body.email }
            });

            let userID = UUID({}, Buffer.alloc(16));
            console.log("AuthController:createChallengeFrom:existingUser -", existingUser);
            if (existingUser) {
                userID = existingUser.handle;
            }

            const user = {
                id: userID, // Generate a new UUID for the user
                name: req.body.email
            }
            store.challenge(req, {user: user}, (err, challenge) => {
                if (err) {
                    return next(err);
                }

                user.id = Buffer.from(user.id).toString('base64'); // Convert UUID to base64 for the client
                // user.id = base64url.encode(user.id); // Convert UUID to base64 for the client

                console.log("AuthController:createChallengeFrom:challenge -", challenge, Buffer.from(challenge).toString('base64'), user, req.body, req.body.email);
                res.json({
                    user: user,
                    challenge: Buffer.from(challenge).toString('base64')
                });
            });
        };
    }
    getChallengeFrom(store) {
        console.log("AuthController:getChallengeFrom:store -", store);
        return (req, res, next) => {
            store.challenge(req, (err, challenge) => {
                if (err) {
                    return next(err);
                }

                console.log("AuthController:getChallengeFrom:challenge -", challenge);
                res.json({
                    challenge: Buffer.from(challenge).toString('base64')
                });
            });
        };
    }
}

module.exports = AuthController;