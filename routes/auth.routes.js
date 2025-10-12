const express = require("express");
const router = express.Router();

const {
  register,
  login,
  test,
  // verifyEmail,
  // resendVerificationEmail,
  googleLogin,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
// router.get("/verify-email", verifyEmail);
// router.post("/resend-verification", resendVerificationEmail);

router.get("/test-email", test);
router.post("/googleLogin", googleLogin);

module.exports = router;
