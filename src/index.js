import './index.css'; // Ensure this path is correct based on your project structure
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getEpisodeData, initFunctions } from "./api";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD4xTiPEx0TjcQIj8glXQSDik4GOpZLNEs",
    authDomain: "makesomepoints.firebaseapp.com",
    projectId: "makesomepoints",
    storageBucket: "makesomepoints",
    messagingSenderId: "155044363840",
    appId: "1:155044363840:web:d71186f12de70bd114a9a5",
    measurementId: "G-4LNLYR5NP7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
initFunctions(app); // Pass the app instance to initFunctions

const App = () => {
    const [userInfo, setUserInfo] = useState(null);

    const handleSignIn = () => {
        chrome.identity.getAuthToken({ interactive: true }, async function (token) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }

            console.log('Auth token:', token);

            const credential = GoogleAuthProvider.credential(null, token);
            try {
                const result = await signInWithCredential(auth, credential);
                const user = result.user;

                console.log('User info:', user);

                // Save user info to Firestore
                await saveUserInfoToFirestore(user);

                setUserInfo({
                    name: user.displayName,
                    picture: user.photoURL,
                });
            } catch (error) {
                console.error('Error signing in:', error);
            }
        });
    };

    const saveUserInfoToFirestore = async (user) => {
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                profilePicUrl: user.photoURL,
                joinedAt: new Date()
            }, { merge: true });
            console.log("User information saved to Firestore");
        } catch (error) {
            console.error("Error saving user information:", error);
        }
    };

    const testEpisodeData = () => {
        getEpisodeData(0, 0).then(data => {
            console.log('Episode Data:', data);
        });
    };

    return (
        <div className="popup-container">
            <h1 className="popup-title">Make Some Points</h1>
            {
                userInfo == null ? (<button className="sign-in-button" onClick={handleSignIn}>Sign in with Google</button>) : null
            }

            {userInfo && (
                <div>
                    <h2 className="welcome-message">Welcome, {userInfo.name}</h2>
                    <img className="profile-pic" src={userInfo.picture} alt="Profile" />
                    <button className="sign-in-button" onClick={testEpisodeData}>Test episode data</button>
                </div>
            )}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
