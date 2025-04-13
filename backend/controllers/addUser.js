import {admin, db, bucket} from '../firebase.js';
const addUser = async (req, res) => {
    try {
      const { userId, name, email, role, classId } = req.body;
      await db.collection("users").doc(userId).set({
        name,
        email,
        role,
        classId: classId || null,
      });
      res.status(200).send("User added successfully!");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
export default addUser;  