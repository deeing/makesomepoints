import React from 'react';

const SeasonSelector = ({ seasons, selectedSeason, onSeasonChange }) => {
    const handleSeasonChange = (event) => {
        const selectedSeason = event.target.value;
        onSeasonChange(selectedSeason);
        chrome.storage.local.set({ selectedSeason });
    };

    return (
        <div>
            <label htmlFor="season-select">Select Season:</label>
            <select id="season-select" onChange={handleSeasonChange} value={selectedSeason || ''}>
                <option value="" disabled>Select a season</option>
                {seasons.map(season => (
                    <option key={season} value={season}>Season {season}</option>
                ))}
            </select>
        </div>
    );
};

export default SeasonSelector;
