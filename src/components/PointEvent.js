import React, { useState, useEffect } from 'react';
import PlayerVote from './PlayerVote';
import { getUserVotes, setUserVotes } from '../utils/api'; // Import your new API functions
import "./PointEvent.css";

const PointEvent = ({ season, episode, pointEventId, player1, player2, player3, eventData, userId }) => {
    const initialVotesData = {
        [player1.id]: { ...player1, points: 0 },
        [player2.id]: { ...player2, points: 0 },
        [player3.id]: { ...player3, points: 0 },
    };
    
    const [votesData, setVotesData] = useState(initialVotesData);
    const [isCollapsed, setIsCollapsed] = useState(true);
    console.log(votesData);

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const fetchedVotesData = await getUserVotes(season, episode, pointEventId, userId);
                setVotesData(prevVotes => {
                    const updatedVotes = { ...prevVotes };
                    for (const playerId in fetchedVotesData.votes) {
                        updatedVotes[playerId] = {
                            ...updatedVotes[playerId],
                            points: fetchedVotesData.votes[playerId]
                        };
                    }
                    return updatedVotes;
                });
            } catch (error) {
                console.error('Error fetching user votes:', error);
            }
        };

        fetchVotes();
    }, [season, episode, pointEventId, userId]);


    const handleVote = (player, points) => {
        setVotesData(prevVotes => ({
            ...prevVotes,
            [player.id]: {
                ...player,
                points: points,
            }
        }));

        setUserVotes(season, episode, pointEventId, userId, {
            ...votesData,
            [player.id]: {
                ...player,
                points: points,
            }
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
                        userVote={votesData[player1.id].points}
                        handleVote={(points) => handleVote(player1, points)}
                    />
                    <PlayerVote
                        player={player2}
                        userVote={votesData[player2.id].points}
                        handleVote={(points) => handleVote(player2, points)}
                    />
                    <PlayerVote
                        player={player3}
                        userVote={votesData[player3.id].points}
                        handleVote={(points) => handleVote(player3, points)}
                    />
                    <button onClick={testGetUserVotes}>Test Get User Votes</button>
                </div>
            )}
        </div>
    );
};

export default PointEvent;
