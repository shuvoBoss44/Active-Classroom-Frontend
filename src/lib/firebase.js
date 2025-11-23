import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC6ty2BIJ2OmHnn3qDUpq09HCjnMC2cOC0",
    authDomain: "active-classroom-1d1a0.firebaseapp.com",
    projectId: "active-classroom-1d1a0",
    storageBucket: "active-classroom-1d1a0.firebasestorage.app",
    messagingSenderId: "743042594270",
    appId: "1:743042594270:web:9f460e6aa5156ddc62d94f",
    measurementId: "G-EP6YN0331K"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);

// Export the initialized instances
export { auth };