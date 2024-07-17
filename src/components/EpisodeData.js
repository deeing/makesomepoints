import React from 'react';

const EpisodeData = ({ data }) => {
    return (
        <div className="episode-data">
            <h3>Episode Data:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default EpisodeData;
