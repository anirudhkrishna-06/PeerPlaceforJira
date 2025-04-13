import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const uploadQuestion = async (req, res) => {
    try {
      const { questionId, title, description, createdBy, attachments } = req.body;
      await db.collection("questions").doc(questionId).set({
        title,
        description,
        attachments: attachments || [],
        createdBy,
        createdAt: admin.firestore.Timestamp.now(),
      });
      res.status(200).send("Question uploaded successfully!");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
export default uploadQuestion;  