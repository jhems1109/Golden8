/**
 * create user
 * login user
 * authenticate user
 * logout user
 * delete user
 */

import User from "../models/user.model.js";
import { getSysParmByParmId } from "../utils/sysParmModule.js";
import { generateOTPEmail } from "../templates/otpEmail.js";
import {
  genHash,
  genSalt,
  generateOTP,
  sendEmail,
} from "../utils/auth.utils.js";
import multer from "multer";

const registerUser = async (req, res) => {
  const { firstName, lastName, userName, email, password, phoneNumber } =
    req.body;

  const existingUsername = await User.findOne({
    userName: new RegExp(`^${userName}$`, "i"),
  });

  if (existingUsername) {
    res.status(200).send({
      requestStatus: "RJCT",
      errMsg: "The username is not available.",
    });
    return;
  }

  const existingUser = await User.findOne({
    email: new RegExp(`^${email}$`, "i"),
  });

  if (existingUser) {
    res.status(200).send({
      requestStatus: "RJCT",
      errMsg: "The email is not available.",
    });
    return;
  }

  let passwordCheck = await isValidPassword(password);
  if (!passwordCheck.valid) {
    res.status(200).send({
      requestStatus: "RJCT",
      errMsg: passwordCheck.errMsg,
    });
    return;
  }

  const salt = genSalt();
  const hashedPassword = await genHash(password, salt);

  const user = await User({
    status: "PEND",
    userName,
    email,
    password: hashedPassword,
    userType: "USER",
    firstName,
    lastName,
    salt,
    phoneNumber,
  }).save();

  if (req.file && req.file.key) {
    const storageProfile = multer.diskStorage({
      destination: (req, file, cb) => {
        const folder = `public/images/profilepictures/`;
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        cb(null, `${req.user._id.toString()}.jpeg`);
      },
    });

    const createProfilePic = multer({ storage: storageProfile }).single(
      "image"
    );
  }

  try {
    if (user) {
      // generating otp
      const otp = generateOTP();
      const otpDate = new Date();

      user.detailsOTP.OTP = parseInt(otp);
      user.detailsOTP.expiryTimeOTP = otpDate.setMinutes(
        otpDate.getMinutes() + 5
      );
      await user.save();

      // generating email
      let emailName = `${firstName} ${lastName}`;
      const html = generateOTPEmail(otp, emailName, email);

      // sending the otp through the provided email for verification
      await sendEmail({
        subject: "Verification OTP for Golden8",
        html: html,
        to: "jemma.macapulay@gmail.com", //process.env.EMAIL, //JAM - Changed from "to: email"
        from: process.env.EMAIL,
      })
        .then(() => {
          console.log("Email has been sent");
        })
        .catch((e) => {
          console.log(`Email could not be sent ${e}`);
        });

      res.status(201).send({ requestStatus: "ACTC", user });
    } else {
      res.status(400);
      throw new Error("Invalid data");
    }
  } catch (error) {
    res.status(400).send({ success: false, error });
  }
};

export { registerUser };

export const isValidPassword = async (password) => {
  let loginParm = await getSysParmByParmId("login");
  loginParm = loginParm.data.login;
  if (password.length < loginParm.minPasswordLength) {
    return {
      valid: false,
      errMsg: `Password must be at least ${loginParm.minPasswordLength} characters.`,
    };
  }
  if (
    loginParm.passwordCriteria.capitalLetterIsRequired &&
    !checkPasswordChar(password, loginParm.passwordCriteria.capitalLettersList)
  ) {
    return { valid: false, errMsg: `Password requires a capital letter.` };
  }
  if (
    loginParm.passwordCriteria.specialCharacterIsRequired &&
    !checkPasswordChar(password, loginParm.passwordCriteria.specialCharsList)
  ) {
    return { valid: false, errMsg: `Password requires a special character.` };
  }
  if (
    loginParm.passwordCriteria.numberIsRequired &&
    !checkPasswordChar(password, loginParm.passwordCriteria.numbersList)
  ) {
    return { valid: false, errMsg: `Password requires a numeric character.` };
  }
  return { valid: true };
};

const checkPasswordChar = (password, charsToCheck) => {
  if (password === "" || charsToCheck === "") {
    return false;
  }
  for (let i = 0; i < password.length; i++) {
    if (charsToCheck.indexOf(password.charAt(i)) != -1) {
      return true;
    }
  }
  return false;
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const otpDate = new Date();
  const user = await User.findOne({
    email: new RegExp(`^${email}$`, "i"),
    status: "ACTV",
  });

  // check if the provided email exists before saving otp to the user object
  if (!user) {
    res.send({
      requestStatus: "RJCT",
      errMsg: "The email does not exist",
    });
  } else {
    // if the user exists generate otp and save
    user.detailsOTP.OTP = parseInt(otp);
    user.detailsOTP.expiryTimeOTP = otpDate.setMinutes(
      otpDate.getMinutes() + 5
    );

    await user.save();

    // generating email
    let emailName = `${user.firstName} ${user.lastName}`;
    const html = generateOTPEmail(otp, emailName, email);

    await sendEmail({
      subject: "OTP for Password Change",
      html: html,
      to: process.env.EMAIL, //JAM - Changed from "to: email"
      from: process.env.EMAIL,
    })
      .then(() => {
        console.log("Email has been sent");
        res.send({ requestStatus: "ACTC" });
      })
      .catch((e) => {
        console.log(`Email could not be sent ${e}`);
        res.send({ requestStatus: "RJCT" });
      });
  }
};

export const resetPassword = async (req, res) => {
  const { newPassword, confirmNewPassword, email, otp } = req.body;
  if (newPassword !== confirmNewPassword) {
    return res.send({
      requestStatus: "RJCT",
      errMsg: "Password does not match",
    });
  }

  const existingUser = await User.findOne({
    email: new RegExp(`^${email}$`, "i"),
    status: "ACTV",
  });

  if (!existingUser) {
    return res.send({
      requestStatus: "RJCT",
      errMsg: "User does not exist",
    });
  }

  if (otp !== existingUser.detailsOTP.OTP) {
    return res.send({
      requestStatus: "RJCT",
      errMsg: "Invalid reset password request",
    });
  }

  let passwordCheck = await isValidPassword(newPassword);
  if (!passwordCheck.valid) {
    return res.status(200).send({
      requestStatus: "RJCT",
      errMsg: passwordCheck.errMsg,
    });
  }

  const salt = genSalt();

  const hashedPassword = await genHash(newPassword, salt);

  let user = await User.findOneAndUpdate(
    { email: new RegExp(`^${email}$`, "i") },
    {
      $set: {
        password: hashedPassword,
        salt: salt,
        detailsOTP: null,
      },
    },
    { new: true }
  );

  res.send({
    requestStatus: "ACTC",
    message: "Password changed successfully",
  });
};
