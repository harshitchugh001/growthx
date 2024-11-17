const express = require("express");
const router = express.Router();
const {userMiddleware,adminMiddleware} = require("../Middleware/Auth.js");
const {
  UserRegister,
  verifyOtp,
  loginUser
} = require("../Controllers/Auth");

const {
    upload,
    getAdmins,
    getAssignments,
    acceptAssignment,rejectAssignment
  } = require("../Controllers/Assignments.js");

router.post('/user-register',UserRegister);
router.post('/verify-user',verifyOtp);
router.post('/login-user',loginUser);

router.post('/upload',userMiddleware,upload);
router.post('/admins',userMiddleware,getAdmins);


// admin

router.post('/assignments',adminMiddleware,getAssignments)
router.post('/assignments/:id/accept',adminMiddleware,acceptAssignment)
router.post('/assignments/:id/reject',adminMiddleware,rejectAssignment)

// router.post('/smssend',sendSms)

module.exports = router;