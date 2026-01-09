import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, updateUserPassword, deleteUserAccount, exportUserData } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRegistration, validateLogin, validateProfileUpdate, validatePasswordChange } from '../middleware/validation.middleware';


const router = express.Router();


router.post('/register', validateRegistration, registerUser);

router.post('/login', validateLogin, loginUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, validateProfileUpdate, updateUserProfile)

router.put('/password', protect, validatePasswordChange, updateUserPassword);

// Delete Account Route
router.delete('/', protect, deleteUserAccount);

// This is for GDPR compliance - need to be able to export the data
router.get('/export', protect, exportUserData);

export default router;