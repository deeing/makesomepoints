import React, { useState, useEffect } from 'react';
import { getChromeStorageData, setChromeStorageData, removeChromeStorageData } from '../utils/chromeStorage';
import { signInWithGoogle, signOut } from '../firebase/auth';
import { saveUserInfoToFirestore } from '../firebase/firestore';
import {fetchEpisodesList, getEpisodeData, initFunctions} from '../utils/api';
import SeasonSelector from './SeasonSelector';
import EpisodeSelector from './EpisodeSelector';
import EpisodeData from './EpisodeData';

const App = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [episodeData, setEpisodeData] = useState(null);

    useEffect(() => {
        initFunctions();
        const loadInitialData = async () => {
            const data = await getChromeStorageData(["userInfo", "episodes", "uniqueSeasons", "selectedSeason", "selectedEpisode"]);

            if (data.userInfo) {
                setUserInfo(data.userInfo);

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

                await updateEpisodesList();
            } else {
                console.log("No user information found. Please log in.");
            }
        };

        loadInitialData();
    }, []);

    const updateEpisodesList = async () => {
        try {
            const { episodes, uniqueSeasons } = await fetchEpisodesList();

            setChromeStorageData({ episodes, uniqueSeasons });

            setEpisodes(episodes);
            setSeasons(uniqueSeasons);
        } catch (error) {
            console.error('Error fetching episodes:', error);
        }
    };

    const handleSignIn = async () => {
        try {
            const user = await signInWithGoogle();
            await saveUserInfoToFirestore(user);

            const userInfo = {
                name: user.displayName,
                picture: user.photoURL,
                token: user.accessToken,
                uid: user.uid,
                email: user.email,
            };

            setChromeStorageData({ userInfo });
            setUserInfo(userInfo);
            await updateEpisodesList();
        } catch (error) {
            console.error('Error signing in:', error);
        }
    };

    const handleLogout = () => {
        removeChromeStorageData(["userInfo", "episodes", "uniqueSeasons", "selectedSeason", "selectedEpisode"]).then(() => {
            setUserInfo(null);
            setEpisodes([]);
            setSeasons([]);
            setSelectedSeason(null);
            setSelectedEpisode(null);
            setEpisodeData(null);
        });

        signOut();
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

                        <SeasonSelector seasons={seasons} selectedSeason={selectedSeason} onSeasonChange={setSelectedSeason} />
                        {selectedSeason && (
                            <EpisodeSelector
                                episodes={episodes.filter(ep => ep.season === parseInt(selectedSeason))}
                                selectedEpisode={selectedEpisode}
                                onEpisodeChange={setSelectedEpisode}
                                setEpisodeData={setEpisodeData} 
                            />
                        )}
                        {episodeData && (
                            <EpisodeData 
                                data={episodeData?.episodeData?.[0]} 
                                userId={userInfo.uid} 
                            />
                        )}
                    </div>
                )
            }
        </div>
    );
};

export default App;
