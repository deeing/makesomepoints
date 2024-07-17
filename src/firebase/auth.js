import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import app from './config';

const auth = getAuth(app);

export const signInWithGoogle = () => {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            const credential = GoogleAuthProvider.credential(null, token);
            try {
                const result = await signInWithCredential(auth, credential);
                resolve(result.user);
            } catch (error) {
                reject(error);
            }
        });
    });
};

export const signOut = () => {
    auth.signOut();
};

export default auth;
