import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';
const getUserByEmail = async (req, res) => {
    try {
      // Extract email from query parameters
      const email = req.query.email;
  
  
      // Check if email is provided
      if (!email) {
        return res.status(400).json({
          error: "Email is required",
          message: "Please provide an email address"
        });
      }
  
  
      // Query Firestore to find user by email
      const querySnapshot = await db.collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();
  
  
      // Check if user exists
      if (querySnapshot.empty) {
        return res.status(404).json({
          message: "No user found with this email"
        });
      }
  
  
      // Return the first (and should be only) matching user
      const userDoc = querySnapshot.docs[0];
      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };
  
  
      // Remove sensitive information if needed
      delete userData.password;
  
  
      res.status(200).json(userData);
    } catch (error) {
      console.error("Error retrieving user:", error);
      res.status(500).json({
        error: error.message,
        message: "Failed to retrieve user"
      });
    }
  };
  
  
  
export default getUserByEmail;  