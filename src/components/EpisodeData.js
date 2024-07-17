import React from 'react';
import PointEvent from './PointEvent';

const EpisodeData = ({ data, userId }) => {
    return (
        <div className="episode-data">
            <h3>Episode Data:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <div className="point-events">
                {data.pointEvents.map(pointEvent => (
                    <PointEvent
                        season={data.season}
                        episode={data.episode}
                        pointEventId={pointEvent.id}
                        player1={data.player1}
                        player2={data.player2}
                        player3={data.player3}
                        key={pointEvent.id} 
                        eventData={pointEvent} 
                        userId={userId} />
                ))}
            </div>
        </div>
    );
};

export default EpisodeData;
