import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/**
* Firebase configuration object for initializing the app instance.
* Contains API key, project identifiers, and service endpoints.
* @type {Object}
*/
const firebaseConfig = {
  apiKey: "AIzaSyDG0C2jfwK82RzUVCFXtsBP8xZeMl-KsAg",
  authDomain: "join-kanban-board-3a477.firebaseapp.com",
  databaseURL: "https://join-kanban-board-3a477-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-kanban-board-3a477",
  storageBucket: "join-kanban-board-3a477.firebasestorage.app",
  messagingSenderId: "239694608283",
  appId: "1:239694608283:web:3374e2cb301de97f7d133e"
};


/**
* Initialize a Firebase app instance using the provided configuration.
* @type {import("firebase/app").FirebaseApp}
*/
const app = initializeApp(firebaseConfig);


/**
* Firebase Authentication service instance bound to the initialized app.
* Exported for usage in login and signup flows.
* @type {import("firebase/auth").Auth}
*/
const auth = getAuth(app);

export { app, auth };
