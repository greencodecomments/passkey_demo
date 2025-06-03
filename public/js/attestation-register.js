class Register {
    async init(event) {
        //1. Get Challenge from server (Relying Party)
        const challenge = await this.getChallenge(event);
        //2. Use Challenge to create public key credential pair
        const credentials = await this.createPublicKeyCredential(challenge);
        //3. Send publicKey and challenge to server to create new user
        const currentUser = await this.loginWithPublicKey(credentials);
        //4. Redirect to user's dashboard
        this.redirectToDashboard(currentUser);
    }
    async getChallenge(event) {
        const form = event.target;
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: new FormData(form)
        });

        if (!response.ok) {
            throw new Error('Failed to get challenge from server');
        }

        return await response.json();
    }

    async createPublicKeyCredential(challengeResp) {
        console.log("attestation-register.js:createPublickKeyCredential", challengeResp);
        const options = {
            publicKey: {
                // challenge: Uint8Array.fromBase64(challengeResp.challenge),
                challenge: Uint8Array.from(atob(challengeResp.challenge), c => c.charCodeAt(0)),
                rp: {
                    name: 'Demo_Passkey Example'
                },
                user: {
                    // id: Uint8Array.fromBase64(challengeResp.user.id),
                    //Uint8Array.from(challengeResp.user.id), 
                    id: Uint8Array.from(atob(challengeResp.user.id), c => c.charCodeAt(0)),
                    name: challengeResp.user.name,
                    displayName: challengeResp.user.name
                },
                pubKeyCredParams: [
                    { type: 'public-key', alg: -7 }, // ES256
                    { type: 'public-key', alg: -257 }, // RS256
                    { type: 'public-key', alg: -8 } // Ed25519
                ],
                authenticatorSelection: {
                    userVerification: 'preferred'
                }
            }
        };
        console.log("attestation-register.js:createPublickKeyCredential:options", options);
        const newCredentials = await navigator.credentials.create(options);
        return newCredentials;
    }

    async loginWithPublicKey(credentials) {
        const options = this.buildLoginOptions(credentials);

        console.log("attestation-register.js:loginWithPublicKey:options", options);
        const response = await fetch('/login/public-key', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(options)
        });

        return await response.json();
    }
    buildLoginOptions(credentials) {
        const options = {
            type: credentials.type,
            response: {
                attestationObject: btoa(String.fromCharCode(...new Uint8Array(credentials.response.attestationObject))),
                clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credentials.response.clientDataJSON)))
            }
        };

        if (credentials.response.getTransports) {
            options.response.transports = credentials.response.getTransports();
        }

        return options;
    }
    redirectToDashboard(currentUser) {
        if (currentUser.ok) {
            window.location.href = currentUser.destination;
        } else {
            alert('Registration failed: ' + currentUser.message);
        }
    }
}

window.addEventListener('load', async () => {
    document.querySelector('#registration-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const register = new Register();
        await register.init(event);
    }
    );
});
