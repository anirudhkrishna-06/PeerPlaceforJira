import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';
// import { v4: uuidv4 } from 'uuid';
const addQuestionToBank = async (req, res) => {
    try {
      const {
        name,
        level,
        description,
        reference,
        company,
        approach,
        remarks,
        createdBy
      } = req.body;
  
  
      if (!name || !description || !createdBy) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
  
      const questionData = {
        name,
        level: level || 'easy',
        description,
        reference: reference || '',
        company: company || '',
        approach: approach || '',
        remarks: remarks || '',
        createdBy,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
  
  
      await db.collection('questionbank').add(questionData);
  
  
      return res.status(200).json({ message: 'Question added to question bank' });
    } catch (err) {
      console.error('Error adding question to bank:', err);
      return res.status(500).json({ message: 'Failed to add question' });
    }
  };
  
  
  
export default addQuestionToBank;  