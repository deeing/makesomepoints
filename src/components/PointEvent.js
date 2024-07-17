import React, { useState, useEffect } from 'react';
import PlayerVote from './PlayerVote';
import "./PointEvent.css";

const PointEvent = ({ player1, player2, player3, eventData, userId }) => {
    const [userVote, setUserVote] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        const players = { player1, player2, player3 };

        Object.keys(players).forEach(playerKey => {
            const player = players[playerKey];
            chrome.storage.local.get([`vote_${eventData.id}_${playerKey}_${userId}`], function (result) {
                if (result[`vote_${eventData.id}_${playerKey}_${userId}`] !== undefined) {
                    setUserVote(prevVotes => ({
                        ...prevVotes,
                        [playerKey]: result[`vote_${eventData.id}_${playerKey}_${userId}`]
                    }));
                }
            });
        });
    }, [eventData.id, player1, player2, player3, userId]);

    const handleVote = (playerKey, points) => {
        setUserVote(prevVotes => ({
            ...prevVotes,
            [playerKey]: points
        }));
        chrome.storage.local.set({ [`vote_${eventData.id}_${playerKey}_${userId}`]: points });
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    }
    
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
                </div>
            )}
        </div>
    );
};

export default PointEvent;
