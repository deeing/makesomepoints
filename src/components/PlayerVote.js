import React from 'react';

const PlayerVote = ({ player, userVote, handleVote }) => {
    return (
        <div className="player-vote">
            <h5>{player.name}</h5>
            <div className="vote-buttons">
                {[0, 1, 2, 3].map(points => (
                    <button
                        key={points}
                        className={userVote === points ? 'selected' : ''}
                        onClick={() => handleVote(points)}
                    >
                        {points} Points
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PlayerVote;
