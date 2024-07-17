import React, { useState, useEffect } from 'react';
import PlayerVote from './PlayerVote';
import { getUserVotes, setUserVotes } from '../utils/api'; // Import your new API functions
import "./PointEvent.css";

const PointEvent = ({ season, episode, pointEventId, player1, player2, player3, eventData, userId }) => {
    const [userVote, setUserVote] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const votesData = await getUserVotes(season, episode, pointEventId, userId);
                setUserVote(votesData.votes);
            } catch (error) {
                console.error('Error fetching user votes:', error);
            }
        };

        fetchVotes();
    }, [season, episode, pointEventId, userId]);

    const handleVote = (playerKey, points) => {
        setUserVote(prevVotes => ({
            ...prevVotes,
            [playerKey]: points
        }));

        setUserVotes(season, episode, pointEventId, userId, {
            ...userVote,
            [playerKey]: points
        }).catch(error => {
            console.error('Error setting user votes:', error);
        });
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const testGetUserVotes = async () => {
        try {
            const votesData = await getUserVotes(season, episode, pointEventId, userId);
            console.log('Fetched votes:', votesData);
        } catch (error) {
            console.error('Error fetching user votes:', error);
        }
    };

    return (
        <div className="point-event">
            <div className="point-event-header" onClick={toggleCollapse}>
                <h4>{eventData.prompt}</h4>
            </div>
            {!isCollapsed && (
                <div className="point-event-content">
                    <h4>Point Event at {eventData.timestamp} seconds</h4>
                    <PlayerVote
                        player={player1}
                        userVote={userVote['player1']}
                        handleVote={(points) => handleVote('player1', points)}
                    />
                    <PlayerVote
                        player={player2}
                        userVote={userVote['player2']}
                        handleVote={(points) => handleVote('player2', points)}
                    />
                    <PlayerVote
                        player={player3}
                        userVote={userVote['player3']}
                        handleVote={(points) => handleVote('player3', points)}
                    />
                    <button onClick={testGetUserVotes}>Test Get User Votes</button>
                </div>
            )}
        </div>
    );
};

export default PointEvent;
