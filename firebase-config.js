// ===== Firebase Configuration =====
// Credentials are injected at runtime by Streamlit from secrets.
// This file is used as a fallback for local development only.
// For production, the Streamlit wrapper injects the config from st.secrets.

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// Initialize Firebase
let app, auth, db;

function initializeFirebase() {
    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// Check if Firebase is configured (returns true when real config is present)
function isFirebaseConfigured() {
    return firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;
}
