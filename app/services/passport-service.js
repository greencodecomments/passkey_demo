const passport = require('passport');
const WebAuthnStrategy = require('passport-fido2-webauthn');
const db = require('../../db/helpers/init');
const models = require('../models'); // Adjust the path as necessary

class PassportService { 
    init(store) {
        //1. configure passport to use WebAuthn
        passport.use(this.useWebauthnStrategy(store));
        //2. passport serialize user
        passport.serializeUser(this.serializeUser);
        //3. passport deserialize user
        passport.deserializeUser(this.deserializeUser);    
    }

    useWebauthnStrategy(store) {
        return new WebAuthnStrategy(
            {store: store},
            this.verify,
            this.register 
        );
    }

    async verify(id, userHandle, done) {
        try {
            // Here you would typically verify the credential against your user database
            // For example, find the user by credential.id and check if it matches
            // If valid, return the user object
            console.log('Passwort-Service: Verifying user with id:', id, 'and user handle:', userHandle);
            const currentCredentials = await models.public_key_credential.findOne({
                where: { external_id: id }
            })
            if (!currentCredentials === null) {
                return done(null, false, { message: 'Invalid key.' });
            }

            const currentUser = await models.user.findOne({
                where: { user_id: currentCredentials.user_id }
            });

            if (currentUser === null) {
                return done(null, false, { message: 'No such user.' });
            }

            console.log('Passwort-Service: Current user:', currentUser);
            if (Buffer.compare(currentUser.handle, userHandle) !== 0) {
                return done(null, false, { message: 'Handles do not match.'});
            }
            return done(null, currentCredentials, currentCredentials.public_key);
        } catch (error) {
            done(error);
        }
    }

    async register(user, id, publicKey, done) {
        const transaction = await db.transaction();
        try {
            console.log('Passwort-Service: Registering user with id:', id, 'and public key:', publicKey, ' and user', user);
            // Check if the user already exists
            const existingUser = await models.user.findOne({
                where: { email: user.name }
            });

            if (existingUser) {
                console.log('Passwort-Service: User already exists:', existingUser);
                return done(null, existingUser);
            }

            // Create a new user record
            const newUser = await models.user.create({
                email: user.name,
                handle: user.id
            }, { transaction });

            if (newUser === null) {
                console.log('Passwort-Service: Could not create user.');
                return done(null, false, { message: 'Could not create user.' });
                // throw new Error('Could not to create user.');
            }

            // Create a new public key credential
            const newCredential = await models.public_key_credential.create({
                user_id: newUser.user_id,
                public_key: publicKey,
                external_id: id
            }, { transaction });

            if (newCredential === null) {
                console.log('Passwort-Service: Could not create public key credential.');
                return done(null, false, { message: 'Could not public key.' });
                // throw new Error('Could not to create user.');
            }

            // Commit the transaction
            await transaction.commit();

            console.log('Passwort-Service: User and public key credential created successfully.');
            return done(null, newUser);
        } catch (error) {
            // Rollback the transaction in case of error
            await transaction.rollback();
            console.error('Passwort-Service: Error creating user or public key credential:', error);
            done(error);
        }
    }

    serializeUser(user, done) {
        // Serialize the user by their ID
        process.nextTick(() => {
            done(null, user);
        });
    }

    deserializeUser(user, done) {
        // Deserialize the user by their ID
        process.nextTick(() => {
            done(null, user);
        });
    }

}

module.exports = PassportService;