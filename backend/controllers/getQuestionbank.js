import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const getQuestionBank = async (req, res) => {
    try {
      const snapshot = await db.collection('questionbank').get();
      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
  
      res.status(200).json(questions);
    } catch (error) {
      console.error('Error fetching question bank:', error);
      res.status(500).json({ message: 'Failed to retrieve question bank' });
    }
  };
  
export default getQuestionBank;  