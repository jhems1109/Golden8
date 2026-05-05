import express from "express";
import multerS3 from "multer-s3";
import multer from "multer";

import {
  forgotPassword,
  registerUser,
  resetPassword,
} from "../controllers/userController.js";
import { login, logout, verifyOTP } from "../controllers/authController.js";
import { s3Storage } from "../config/s3-bucket.js";

const router = express.Router();

// Store temporary profile picture as userid is not yet created at this stage
const storage = multerS3({
  s3: s3Storage,
  bucket: "golden8",
  contentType: multerS3.AUTO_CONTENT_TYPE, 
  key: (req, file, cb) => {
    const fileName = `images/profilepictures/${
      Date.now() + "-" + file.originalname
    }`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage }).single("image");

// registration and login processes
router.post("/login", login);
router.post("/register", upload, registerUser);
router.post("/verifyotp", verifyOTP);
router.post("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);

export default router;
