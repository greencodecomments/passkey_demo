class Login {
    async init() {
        //1. Check that conditional mediation is supported
        await this.checkConditionalMediationSupport();
        //2. Get Challenge from server (Relying Party)
        const challenge = await this.getChallenge();
        //3. Use existing public key credential to authenticate user
        const credentials = await this.authenticateWithPublicKey(challenge);
        //4. Use the public key credential to login user
        const currentUser = await this.loginWithPublicKey(credentials);
        //5. Redirect to user's dashboard
        this.redirect(currentUser);
    }

    async checkConditionalMediationSupport() {
        const isCMA = await window.PublicKeyCredential.isConditionalMediationAvailable();

        if (!isCMA) {
            console.log('Conditional mediation is not supported.');
            return;
        }
    }
    async getChallenge() {
        const response = await fetch('/login/public-key/challenge', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log("assertion-login.js:getChallenge:response", response);
        if (!response.ok) {
            throw new Error('Failed to get challenge from server');
        }

        return await response.json();
    }
    async authenticateWithPublicKey(challengeResp) {
        console.log("assertion-login.js:authenticateWithPublicKey", challengeResp);
        const options = {
            mediation: 'conditional',
            publicKey: {
                challenge: Uint8Array.from(atob(challengeResp.challenge), c => c.charCodeAt(0))
            }
        };
        console.log("assertion-login.js:authenticateWithPublicKey:options", options);
        let credentials;
        try {
            credentials = await navigator.credentials.get(options);
        } catch (error) {
            console.error('Error during navigator.credentials.get:', error);
            throw new Error('Failed to get credentials from navigator.credentials.get');
        }
        console.log("assertion-login.js:authenticateWithPublicKey:credentials", credentials);
        if (!credentials) {
            throw new Error('No credentials returned from navigator.credentials.get');
        }
        return credentials;
    }

    async loginWithPublicKey(credentials) {
        console.log("assertion-login.js:loginWithPublicKey", credentials);
        const options = {
            id: credentials.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(credentials.rawId))),
            response: {
                authenticatorData: btoa(String.fromCharCode(...new Uint8Array(credentials.response.authenticatorData))),
                clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credentials.response.clientDataJSON))),
                signature: btoa(String.fromCharCode(...new Uint8Array(credentials.response.signature))),
                userHandle: credentials.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(credentials.response.userHandle))) : null
            }
        };
        if (credentials.authenticatorAttachment) {
            options.publicKey = {
                authenticatorAttachment: credentials.authenticatorAttachment
            };
        }
        const response = await fetch('/login/public-key', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(options)
        });
        console.log("assertion-login.js:loginWithPublicKey:response", response);

        if (!response.ok) {
            throw new Error('Failed to login with public key');
        }

        return await response.json();
    }
    redirect(currentUser) {
        console.log("assertion-login.js:redirect", currentUser);
        if (currentUser.ok) {
            window.location.href = currentUser.destination;
        } else {
            console.error('Login failed:', currentUser);
            alert('Login failed. Please try again.');
        }
    }
}

window.addEventListener('load', async () => {
    await triggerLogin();
});
// document.querySelector('#email-input').addEventListener('click', async (event) => {
//     await triggerLogin();
// });

async function triggerLogin() {
    const login = new Login();

    if (window.PublicKeyCredential) {
        await login.init();
    }
    else {
        console.error('WebAuthn is not supported in this browser.');
        alert('WebAuthn is not supported in this browser. Please use a compatible browser.');
    }    
}