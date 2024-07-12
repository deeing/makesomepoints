import './index.css'; // Ensure this path is correct based on your project structure
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import {getEpisodeData, getEpisodesList, initFunctions} from "./api";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD4xTiPEx0TjcQIj8glXQSDik4GOpZLNEs",
    authDomain: "makesomepoints.firebaseapp.com",
    projectId: "makesomepoints",
    storageBucket: "makesomepoints.appspot.com",
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
    const [episodes, setEpisodes] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [episodeData, setEpisodeData] = useState(null);

    useEffect(() => {
        chrome.storage.local.get(["userInfo", "episodes", "uniqueSeasons", "selectedSeason", "selectedEpisode"], async function (data) {
            if (data.userInfo) {
                setUserInfo(data.userInfo);

                // If cached episodes, seasons, selected season, and selected episode are found, use them
                if (data.episodes && data.uniqueSeasons) {
                    setEpisodes(data.episodes);
                    setSeasons(data.uniqueSeasons);
                }

                if (data.selectedSeason) {
                    setSelectedSeason(data.selectedSeason);
                }

                if (data.selectedEpisode) {
                    setSelectedEpisode(data.selectedEpisode);
                    const selectedEpisodeData = data.episodes.find(ep => ep.id === data.selectedEpisode);
                    if (selectedEpisodeData) {
                        const episodeData = await getEpisodeData(selectedEpisodeData.season, selectedEpisodeData.episode);
                        setEpisodeData(episodeData);
                    }
                }

                // Fetch and update episodes list from the API
                await fetchEpisodesList();
            } else {
                console.log("No user information found. Please log in.");
            }
        });
    }, []);

    const fetchEpisodesList = async () => {
        try {
            const episodes = await getEpisodesList();

            // Extract unique seasons
            const uniqueSeasons = [...new Set(episodes.map(ep => ep.season))];

            chrome.storage.local.get(["episodes", "uniqueSeasons"], function (data) {
                // Check if fetched data is different from the cached data
                const isEpisodesDifferent = JSON.stringify(data.episodes) !== JSON.stringify(episodes);
                const isSeasonsDifferent = JSON.stringify(data.uniqueSeasons) !== JSON.stringify(uniqueSeasons);

                if (isEpisodesDifferent || isSeasonsDifferent) {
                    setEpisodes(episodes);
                    setSeasons(uniqueSeasons);

                    // Store updated episodes and seasons in chrome.storage.local
                    chrome.storage.local.set({ episodes, uniqueSeasons });
                }
            });
        } catch (error) {
            console.error('Error fetching episodes:', error);
        }
    };


    const handleSignIn = () => {
        chrome.identity.getAuthToken({ interactive: true }, async function (token) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }

            const credential = GoogleAuthProvider.credential(null, token);
            try {
                const result = await signInWithCredential(auth, credential);
                const user = result.user;

                await saveUserInfoToFirestore(user);

                const userInfo = {
                    name: user.displayName,
                    picture: user.photoURL,
                    token: token,
                    uid: user.uid,
                    email: user.email,
                };

                // Store user info in chrome.storage.local
                chrome.storage.local.set({ userInfo: userInfo });

                setUserInfo(userInfo);

                // Fetch episodes list after successful sign-in
                await fetchEpisodesList();
            } catch (error) {
                console.error('Error signing in:', error);
            }
        });
    };

    const handleLogout = () => {
        chrome.storage.local.remove(["userInfo", "episodes", "uniqueSeasons", "selectedSeason", "selectedEpisode"], function () {
            setUserInfo(null);
            setEpisodes([]);
            setSeasons([]);
            setSelectedSeason(null);
            setSelectedEpisode(null);
            setEpisodeData(null);
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

    const handleSeasonChange = (event) => {
        const selectedSeason = event.target.value;
        setSelectedSeason(selectedSeason);
        setSelectedEpisode(null);

        // Store selected season in chrome.storage.local
        chrome.storage.local.set({ selectedSeason });
    };

    const handleEpisodeChange = async (event) => {
        const selectedEpisode = event.target.value;
        setSelectedEpisode(selectedEpisode);

        // Store selected episode in chrome.storage.local
        chrome.storage.local.set({ selectedEpisode });

        try {
            const selectedEpisodeData = episodes.find(ep => ep.id === selectedEpisode);
            const data = await getEpisodeData(selectedEpisodeData.season, selectedEpisodeData.episode);
            setEpisodeData(data);
        } catch (error) {
            console.error('Error fetching episode data:', error);
        }
    };

    return (
        <div className="popup-container">
            <h1 className="popup-title">Make Some Points</h1>
            {
                userInfo == null ? (
                    <button className="sign-in-button" onClick={handleSignIn}>Sign in with Google</button>
                ) : (
                    <div>
                        <h2 className="welcome-message">Welcome, {userInfo.name}</h2>
                        <img className="profile-pic" src={userInfo.picture} alt="Profile" />
                        <button className="sign-out-button" onClick={handleLogout}>Sign out</button>

                        <div>
                            <label htmlFor="season-select">Select Season:</label>
                            <select id="season-select" onChange={handleSeasonChange} value={selectedSeason || ''}>
                                <option value="" disabled>Select a season</option>
                                {seasons.map(season => (
                                    <option key={season} value={season}>Season {season}</option>
                                ))}
                            </select>
                        </div>

                        {selectedSeason && (
                            <div>
                                <label htmlFor="episode-select">Select Episode:</label>
                                <select id="episode-select" onChange={handleEpisodeChange} value={selectedEpisode || ''}>
                                    <option value="" disabled>Select an episode</option>
                                    {episodes
                                        .filter(ep => ep.season === parseInt(selectedSeason))
                                        .map(ep => (
                                            <option key={ep.id} value={ep.id}>Episode {ep.episode}: {ep.title}</option>
                                        ))}
                                </select>
                            </div>
                        )}

                        {episodeData && (
                            <div className="episode-data">
                                <h3>Episode Data:</h3>
                                <pre>{JSON.stringify(episodeData, null, 2)}</pre>
                            </div>
                        )}

                    </div>
                )
            }
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
