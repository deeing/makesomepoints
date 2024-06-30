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
