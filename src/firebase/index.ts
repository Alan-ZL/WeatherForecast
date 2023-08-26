import {
    initializeApp
} from "firebase/app";
import {
    getAnalytics
} from "firebase/analytics";

interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
    apiKey: "AIzaSyCnwih2hpvHrvubdxkaC__JSENGQFH_6Bo",
    authDomain: "weather-forecast--demo.firebaseapp.com",
    projectId: "weather-forecast--demo",
    storageBucket: "weather-forecast--demo.appspot.com",
    messagingSenderId: "170643249784",
    appId: "1:170643249784:web:8dfc834693dc03464c2b8d",
    measurementId: "G-L6NJ09C7VD"
};

const app = initializeApp(firebaseConfig);
// @ts-ignore
const analytics = getAnalytics(app);