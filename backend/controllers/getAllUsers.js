import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const getAllUsers = async (req, res) => {
    try {
      const snapshot = await db.collection("users").get();
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
export default getAllUsers;  