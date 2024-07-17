import React from 'react';
import { getEpisodeData } from '../utils/api';

const EpisodeSelector = ({ episodes, selectedEpisode, onEpisodeChange, setEpisodeData }) => { // Add setEpisodeData to props
    const handleEpisodeChange = async (event) => {
        const selectedEpisode = event.target.value;
        onEpisodeChange(selectedEpisode);
        chrome.storage.local.set({ selectedEpisode });

        try {
            const selectedEpisodeData = episodes.find(ep => ep.id === selectedEpisode);
            const data = await getEpisodeData(selectedEpisodeData.season, selectedEpisodeData.episode);
            setEpisodeData(data); // Use setEpisodeData to update the state
        } catch (error) {
            console.error('Error fetching episode data:', error);
        }
    };

    return (
        <div>
            <label htmlFor="episode-select">Select Episode:</label>
            <select id="episode-select" onChange={handleEpisodeChange} value={selectedEpisode || ''}>
                <option value="" disabled>Select an episode</option>
                {episodes.map(ep => (
                    <option key={ep.id} value={ep.id}>Episode {ep.episode}: {ep.title}</option>
                ))}
            </select>
        </div>
    );
};

export default EpisodeSelector;
