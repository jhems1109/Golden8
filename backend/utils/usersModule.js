import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import SystemParameterModel from "../models/systemParameter.model.js";
import RoomModel from "../models/room.model.js";

import { genHash, genSalt } from "./auth.utils.js";
import { isValidPassword } from "../controllers/userController.js";
import { getRoomDetails } from "./roomsModule.js";
import { getSysParmById } from "./sysParmModule.js";

let ObjectId = mongoose.Types.ObjectId;
const userStatus = [
  { desc: "Active", code: "ACTV" },
  { desc: "Locked", code: "LOCK" },
  { desc: "Pending", code: "PEND" },
];

export const getMyProfile = async function (userId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let myProfile = await getAccountDetails(userId);
  return myProfile;
};

export const getAccountDetails = async function (userId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(userId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "User Id is required.";
    return response;
  }

  let user = await UserModel.aggregate([
    {
      $match: {
        _id: new ObjectId(userId),
        userType: "USER",
        status: { $ne: "PEND" },
      },
    },
    {
      $addFields: {
        userId: "$_id",
        fullName: {
          $reduce: {
            input: ["$firstName", " ", "$lastName"],
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this"],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        userId: 1,
        status: 1,
        firstName: 1,
        lastName: 1,
        fullName: 1,
        userName: 1,
        email: 1,
        phoneNumber: 1,
      },
    },
  ])
    .limit(1)
    .catch((error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
      return response;
    });

  if (user.length === 0) {
    response.requestStatus = "RJCT";
    response.errMsg = "No data found";
    response.details = {};
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = user[0];
  return response;
};

export const updateAccount = async function (userId, details) {
  let response = { requestStatus: "", errField: "", errMsg: "" };
  if (!mongoose.isValidObjectId(userId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "User Id is required.";
    return response;
  }

  const existingUsername = await UserModel.findOne({
    userName: new RegExp(`^${details.userName}$`, "i"),
  });
  if (
    existingUsername !== null &&
    !existingUsername._id.equals(new ObjectId(userId))
  ) {
    response.requestStatus = "RJCT";
    response.errField = "userName";
    response.errMsg = "The username is not available";
    return response;
  }

  let user = await UserModel.updateOne(
    { _id: new ObjectId(userId), userType: "USER", status: "ACTV" },
    {
      $set: {
        userName: details.userName.trim(),
        phoneNumber: details.phoneNumber.trim(),
        firstName: details.firstName.trim(),
        lastName: details.lastName.trim(),
      },
    }
  );
  if (user.modifiedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Account update was not successful";
    return response;
  }

  response.requestStatus = "ACTC";
  return response;
};

export const changePassword = async function (userId, details) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(userId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "User Id is required.";
    return response;
  }

  if (details.currentPassword === "") {
    response.requestStatus = "RJCT";
    response.errField = "currentPassword";
    response.errMsg = "Current password is required.";
    return response;
  }
  if (details.newPassword === "") {
    response.requestStatus = "RJCT";
    response.errField = "newPassword";
    response.errMsg = "New password is required.";
    return response;
  }
  if (details.currentPassword === details.newPassword) {
    response.requestStatus = "RJCT";
    response.errField = "newPassword";
    response.errMsg = "Current and new passwords cannot be the same.";
    return response;
  }
  if (details.confirmNewPassword === "") {
    response.requestStatus = "RJCT";
    response.errField = "confirmNewPassword";
    response.errMsg = "Confirm new password is required.";
    return response;
  }
  if (details.newPassword !== details.confirmNewPassword) {
    response.requestStatus = "RJCT";
    response.errField = "confirmNewPassword";
    response.errMsg = "New password and confirm new password must be the same.";
    return response;
  }

  const userDetails = await UserModel.findOne(
    { _id: new ObjectId(userId), userType: "USER", status: "ACTV" },
    { password: 1, salt: 1 }
  );
  if (userDetails === null) {
    response.requestStatus = "RJCT";
    response.errMsg = "Invalid user";
    return response;
  }

  let hashedPassword = genHash(details.currentPassword, userDetails.salt);
  if (hashedPassword !== userDetails.password) {
    response.requestStatus = "RJCT";
    response.errField = "currentPassword";
    response.errMsg = "Incorrect current password";
    return response;
  }

  let passwordCheck = await isValidPassword(details.newPassword);
  if (!passwordCheck.valid) {
    response.requestStatus = "RJCT";
    response.errField = "newPassword";
    response.errMsg = passwordCheck.errMsg;
    return response;
  }

  const newSalt = genSalt();
  hashedPassword = genHash(details.newPassword, newSalt);
  let user = await UserModel.updateOne(
    { _id: new ObjectId(userId), userType: "USER", status: "ACTV" },
    {
      $set: {
        password: hashedPassword,
        salt: newSalt,
      },
    }
  );
  if (user.modifiedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Password update was not successful";
    return response;
  }

  response.requestStatus = "ACTC";
  return response;
};

export const unlockAccounts = async function () {
  await UserModel.updateMany(
    {
      status: "LOCK",
      "failedLoginDetails.lockedTimestamp": { $lte: new Date() },
    },
    {
      $set: {
        status: "ACTV",
        "failedLoginDetails.lockedTimestamp": null,
        "failedLoginDetails.numberOfLoginTries": 0,
        "failedLoginDetails.numberOfFailedLogins": 0,
      },
    }
  );
  return;
};

export const deletePendingAccounts = async function () {
  const currDate = new Date();
  let housekeepDate = currDate.setMinutes(currDate.getMinutes() - 5);
  await UserModel.deleteMany({
    status: "PEND",
    "detailsOTP.expiryTimeOTP": { $lte: housekeepDate },
  });
  return;
};
