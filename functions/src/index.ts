import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const serializeDocumentReference = (docRef: admin.firestore.DocumentReference) => {
  return docRef.path;
};

const fetchPlayerData = async (path: string) => {
  const playerRef = admin.firestore().doc(path);
  const playerSnapshot = await playerRef.get();
  if (!playerSnapshot.exists) {
    throw new Error(`Player data not found at path: ${path}`);
  }
  return playerSnapshot.data();
};

export const getEpisodeData = functions.https.onCall(async (data, context) => {
  console.log("Function called with data:", data);

  if (!context.auth) {
    console.error("User not authenticated");
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The user must be authenticated to call this function."
    );
  }

  const { season, episode } = data;

  if (typeof season !== "number" || typeof episode !== "number") {
    console.error("Invalid arguments. Season or episode missing or not a number.");
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Season and episode must be provided and must be numbers."
    );
  }

  try {
    console.log(`Fetching data for season: ${season}, episode: ${episode}`);
    const episodeRef = admin
      .firestore()
      .collection("episodes")
      .where("season", "==", season)
      .where("episode", "==", episode);
    const snapshot = await episodeRef.get();

    if (snapshot.empty) {
      console.error(`Episode not found for season: ${season}, episode: ${episode}`);
      throw new functions.https.HttpsError("not-found", "Episode not found.");
    }

    // Extract and serialize data from snapshot
    const episodeData = snapshot.docs.map(async (doc) => {
      const data = doc.data();
      console.log("Document data before serialization:", data);

      // Serialize DocumentReference objects
      const player1Path = serializeDocumentReference(data.player1);
      const player2Path = serializeDocumentReference(data.player2);
      const player3Path = serializeDocumentReference(data.player3);

      // Fetch player data
      const player1Data = await fetchPlayerData(player1Path);
      const player2Data = await fetchPlayerData(player2Path);
      const player3Data = await fetchPlayerData(player3Path);

      // Add player data to episode data
      return {
        ...data,
        player1: player1Data,
        player2: player2Data,
        player3: player3Data,
      };
    });

    const resolvedEpisodeData = await Promise.all(episodeData);

    console.log("Episode data retrieved and serialized successfully:", resolvedEpisodeData);

    return { episodeData: resolvedEpisodeData };
  } catch (error) {
    console.error("Error retrieving episode data:", error);
    throw new functions.https.HttpsError(
      "unknown",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});
