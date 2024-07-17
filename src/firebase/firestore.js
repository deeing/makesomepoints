import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from './config';

const db = getFirestore(app);

export const saveUserInfoToFirestore = async (user) => {
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            profilePicUrl: user.photoURL,
            joinedAt: new Date()
        }, { merge: true });
        console.log("User information saved to Firestore");
    } catch (error) {
        console.error("Error saving user information:", error);
    }
};

export default db;
