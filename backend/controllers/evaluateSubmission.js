import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const evaluateSubmission = async (req, res) => {
    try {
      const { submissionId, marks, feedback, evaluatedBy } = req.body;
      await db.collection("submissions").doc(submissionId).update({
        evaluation: {
          marks,
          feedback,
          evaluatedBy,
          evaluatedAt: admin.firestore.Timestamp.now(),
        },
      });
      res.status(200).send("Submission evaluated successfully!");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
    
  
export default evaluateSubmission;  