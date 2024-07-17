import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyD4xTiPEx0TjcQIj8glXQSDik4GOpZLNEs",
    authDomain: "makesomepoints.firebaseapp.com",
    projectId: "makesomepoints",
    storageBucket: "makesomepoints.appspot.com",
    messagingSenderId: "155044363840",
    appId: "1:155044363840:web:d71186f12de70bd114a9a5",
    measurementId: "G-4LNLYR5NP7"
};

const app = initializeApp(firebaseConfig);

export default app;
