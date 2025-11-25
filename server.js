// server.js (Firebase/Express Backend)

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// NOTE: This path MUST be correct for your environment.
// For local testing, you might need to adjust the path to your service account JSON file.
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
const USERS_COLLECTION = "users";
const app = express();
const PORT = 3000;

// --- Middleware ---
// Allows your frontend (e.g., http://localhost:5000) to communicate with this server
app.use(cors()); 
// Parses incoming JSON request bodies
app.use(express.json()); 

// --- 1. CREATE User (POST /api/users) - Handles Registration ---
app.post("/api/users", async (req, res) => {
    try {
        const userData = req.body;
        
        // Basic required field validation based on your frontend POST data
        if (!userData.fullName || !userData.email || !userData.phoneNumber || !userData.address || !userData.password) {
             return res.status(400).json({ message: "Missing required fields (fullName, email, phoneNumber, address, password)." });
        }
        
        // Add server timestamp and save to Firestore
        userData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection(USERS_COLLECTION).add(userData);
        
        // Send back the ID along with the created data
        res.status(201).json({ id: docRef.id, ...userData });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Failed to create user." });
    }
});

// --- 2. READ All Users (GET /api/users) - Handles User List Fetch ---
app.get("/api/users", async (req, res) => {
    try {
        const snapshot = await db.collection(USERS_COLLECTION).get();
        // Map Firestore documents to array of objects, including the document ID
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); 
        
        // Note: The 'password' field is returned here. For security, 
        // you should strip it out before sending it to the frontend, but 
        // the original code returns everything.
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Failed to fetch users." });
    }
});

// --- 3. UPDATE User (PUT /api/users/:id) ---
app.put("/api/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        
        // Prevent accidental password overwrite if not intended by the update form
        delete updateData.password; 
        
        const docRef = db.collection(USERS_COLLECTION).doc(id);
        await docRef.update(updateData);
        
        res.status(200).json({ id: id, message: "User updated successfully" });
    } catch (err) {
        console.error("Error updating user:", err);
        // Respond with 404 if the document doesn't exist
        res.status(404).json({ message: "User not found or update failed." });
    }
});

// --- 4. DELETE User (DELETE /api/users/:id) ---
app.delete("/api/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await db.collection(USERS_COLLECTION).doc(id).delete();
        
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(404).json({ message: "User not found or delete failed." });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log("🔥 Connected to Firebase Firestore.");
});
