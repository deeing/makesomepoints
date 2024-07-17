import { getFunctions, httpsCallable } from 'firebase/functions';

let functions = null;

export const initFunctions = (app) => {
    functions = getFunctions(app);
};

export const getEpisodeData = async (season, episode) => {
    try {
        const getEpisodeDataFunction = httpsCallable(functions, 'getEpisodeData');
        const result = await getEpisodeDataFunction({ season, episode });
        console.log(result.data);
        return result.data;
    } catch (error) {
        console.error('Error getting episode data:', error);
        throw error; // Rethrow error for proper handling
    }
};

export const getEpisodesList = async () => {
    try {
        const getEpisodesListFunction = httpsCallable(functions, 'getEpisodesList');
        const result = await getEpisodesListFunction();
        console.log(result.data);
        return result.data.episodes;
    } catch (error) {
        console.error('Error getting episodes list:', error);
        throw error; // Rethrow error for proper handling
    }
};

export const fetchEpisodesList = async () => {
    try {
        const episodes = await getEpisodesList();
        const uniqueSeasons = [...new Set(episodes.map(ep => ep.season))];
        return { episodes, uniqueSeasons };
    } catch (error) {
        console.error('Error fetching episodes:', error);
        throw error;
    }
};

export const getUserVotes = async (season, episode, pointEventId, userId) => {
    try {
        const getUserVotesFunction = httpsCallable(functions, 'getUserVotes');
        const result = await getUserVotesFunction({ season, episode, pointEventId, userId });
        return result.data;
    } catch (error) {
        throw error;
    }
};

export const setUserVotes = async (season, episode, pointEventId, userId, votes) => {
    try {
        const setUserVotesFunction = httpsCallable(functions, 'setUserVotes');
        await setUserVotesFunction({ season, episode, pointEventId, userId, votes });
        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const getMajorityVotes = async (season, episode, pointEventId) => {
    try {
        const getMajorityVotesFunction = httpsCallable(functions, 'getMajorityVotes');
        const result = await getMajorityVotesFunction({ season, episode, pointEventId });
        return result.data;
    } catch (error) {
        console.error('Error getting majority votes:', error);
        throw error;
    }
};