import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const getAllQuestions = async (req, res) => {
    try {
      const snapshot = await db.collection("questions").get();
      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({
        error: error.message,
        message: "Failed to retrieve questions"
      });
    }
  };
  
  
export default getAllQuestions;  