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

const fetchPointEvents = async (episodeRef: admin.firestore.DocumentReference) => {
  const pointEventsRef = episodeRef.collection("pointEvents");
  const pointEventsSnapshot = await pointEventsRef.get();
  if (pointEventsSnapshot.empty) {
    return [];
  }

  return pointEventsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
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
    const episodeDataPromises = snapshot.docs.map(async (doc) => {
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

      // Fetch point events data
      const pointEvents = await fetchPointEvents(doc.ref);

      // Add player and point events data to episode data
      return {
        ...data,
        player1: { id: player1Path, ...player1Data },
        player2: { id: player2Path, ...player2Data },
        player3: { id: player3Path, ...player3Data },
        pointEvents,
      };
    });

    const resolvedEpisodeData = await Promise.all(episodeDataPromises);

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

export const getEpisodesList = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The user must be authenticated to call this function."
    );
  }

  try {
    const episodesRef = admin.firestore().collection("episodes");
    const snapshot = await episodesRef.select("title", "episode", "season").get();

    if (snapshot.empty) {
      throw new functions.https.HttpsError("not-found", "No episodes found.");
    }

    const episodesList = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      episode: doc.data().episode,
      season: doc.data().season
    }));

    return { episodes: episodesList };
  } catch (error) {
    console.error("Error fetching episodes list:", error);
    throw new functions.https.HttpsError(
      "unknown",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});

interface Votes {
  [key: string]: number;
}

export const getUserVotes = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The user must be authenticated to call this function."
    );
  }

  const { season, episode, pointEventId, userId } = data;

  if (typeof season !== "number" || typeof episode !== "number" || typeof pointEventId !== "string" || typeof userId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Season, episode, pointEventId, and userId must be provided and must be of the correct type."
    );
  }

  try {
    const episodeId = `s${season}e${episode}`;
    const userVotesRef = admin.firestore()
      .collection("episodes")
      .doc(episodeId)
      .collection("pointEvents")
      .doc(pointEventId)
      .collection("userVotes")
      .doc(userId)
      .collection("userVotePoints");

    const userVotesSnapshot = await userVotesRef.get();

    if (userVotesSnapshot.empty) {
      return { votes: {} as Votes };
    }

    const votes: Votes = {};
    userVotesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data && typeof data.playerId === 'string' && typeof data.vote === 'number') {
        votes[data.playerId] = data.vote;
      }
    });

    return { votes };
  } catch (error) {
    console.error("Error fetching user votes:", error);
    throw new functions.https.HttpsError(
      "unknown",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});

/**
 * TODO: Figure out why majority is not returning anything!
 */
export const getMajorityVotes = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The user must be authenticated to call this function."
    );
  }

  const { season, episode, pointEventId } = data;

  if (typeof season !== "number" || typeof episode !== "number" || typeof pointEventId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Season, episode, and pointEventId must be provided and must be of the correct type."
    );
  }

  try {
    const episodeId = `s${season}e${episode}`;

    // Using collectionGroup to query all userVotes collections across Firestore
    const userVotesQuery = admin.firestore()
      .collectionGroup('userVotes')
      .where('episodeId', '==', episodeId)
      .where('pointEventId', '==', pointEventId);

    const userVotesSnapshot = await userVotesQuery.get();
    console.log("userVotesSnapshot size:", userVotesSnapshot.size);

    if (userVotesSnapshot.empty) {
      console.log("No user votes found for pointEventId:", pointEventId);
      return { message: "No user votes found", userVotes: [] };
    }

    const votesCount: { [playerId: string]: { [vote: number]: number } } = {};

    // Aggregate all votes
    await Promise.all(userVotesSnapshot.docs.map(async doc => {
      const data = doc.data();
      console.log("User vote data:", data);

      const userVotePointsRef = doc.ref.collection("userVotePoints");
      const userVotePointsSnapshot = await userVotePointsRef.get();
      console.log(`userVotePoints snapshot size for user ${doc.id}:`, userVotePointsSnapshot.size);

      if (userVotePointsSnapshot.empty) {
        console.log(`No vote points found for user: ${doc.id}`);
      } else {
        userVotePointsSnapshot.forEach(voteDoc => {
          const voteData = voteDoc.data();
          console.log("Vote point data:", voteData);
          if (voteData && typeof voteData.playerId === 'string' && typeof voteData.vote === 'number') {
            if (!votesCount[voteData.playerId]) {
              votesCount[voteData.playerId] = {};
            }
            votesCount[voteData.playerId][voteData.vote] = (votesCount[voteData.playerId][voteData.vote] || 0) + 1;
          }
        });
      }
    }));

    console.log("Votes count:", votesCount);

    // Determine the majority vote for each player
    const majorityVotes: { [playerId: string]: number } = {};
    for (const playerId in votesCount) {
      const playerVotes = votesCount[playerId];
      const majorityVote = (Object.keys(playerVotes) as string[]).reduce((a: string, b: string) =>
        playerVotes[parseInt(a)] > playerVotes[parseInt(b)] ? a : b
      );
      majorityVotes[playerId] = parseInt(majorityVote, 10);
    }

    console.log("Majority votes:", majorityVotes);
    return {
      majorityVotes,
      userVotes: userVotesSnapshot.docs.map(doc => doc.id)
    };
  } catch (error) {
    console.error("Error fetching majority votes:", error);
    throw new functions.https.HttpsError(
      "unknown",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});

export const setUserVotes = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The user must be authenticated to call this function."
    );
  }

  const { season, episode, pointEventId, userId, votes } = data;

  if (typeof season !== "number" || typeof episode !== "number" || typeof pointEventId !== "string" || typeof userId !== "string" || typeof votes !== "object") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Season, episode, pointEventId, userId, and votes must be provided and must be of the correct type."
    );
  }

  try {
    const episodeId = `s${season}e${episode}`;
    const batch = admin.firestore().batch();
    const userVotesRef = admin.firestore()
      .collection("episodes")
      .doc(episodeId)
      .collection("pointEvents")
      .doc(pointEventId)
      .collection("userVotes")
      .doc(userId);

    // Delete existing votes in userVotePoints sub-collection
    const userVotePointsRef = userVotesRef.collection("userVotePoints");
    const existingVotesSnapshot = await userVotePointsRef.get();
    existingVotesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Set new votes in userVotePoints sub-collection
    Object.keys(votes).forEach(playerId => {
      const voteDocRef = userVotePointsRef.doc();
      batch.set(voteDocRef, { playerId, vote: votes[playerId].points });
    });

    // Set the userVotes document with episodeId and pointEventId fields
    batch.set(userVotesRef, { episodeId, pointEventId }, { merge: true });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error setting user votes:", error);
    throw new functions.https.HttpsError(
      "unknown",
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
});
