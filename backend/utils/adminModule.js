import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import SystemParameterModel from "../models/systemParameter.model.js";
import RoomModel from "../models/room.model.js";

import { genHash, genSalt } from "./auth.utils.js";
import { isValidPassword } from "../controllers/userController.js";
import { getAccountDetails } from "./usersModule.js";
import { getSysParmById } from "./sysParmModule.js";
import { getRoomDetails } from "./roomsModule.js";

let ObjectId = mongoose.Types.ObjectId;
const userStatus = [
  { desc: "Active", code: "ACTV" },
  { desc: "Locked", code: "LOCK" },
  { desc: "Pending", code: "PEND" },
];

export const adminGetUsers = async function () {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let users = await UserModel.aggregate([
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
        status: 1,
        userId: 1,
        userName: 1,
        fullName: 1,
        email: 1,
        userType: 1,
      },
    },
  ]).catch((error) => {
    response.requestStatus = "RJCT";
    response.errMsg = error;
    return response;
  });

  if (users.length === 0) {
    response.requestStatus = "ACTC";
    response.errMsg = "No data found";
    response.details = [];
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = users;
  return response;
};

export const adminGetUserDetails = async function (userId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(userId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "User Id is required.";
    return response;
  }

  let user = await UserModel.findOne({ _id: new ObjectId(userId) }).catch(
    (error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
      return response;
    }
  );

  if (user === null) {
    response.requestStatus = "RJCT";
    response.errMsg = "No data found";
    response.details = {};
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = user;
  return response;
};

export const adminCreateUser = async function (details) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let valid = userValidation(details);
  if (valid.requestStatus !== "ACTC") {
    return valid;
  }

  let existingUsername = await UserModel.findOne({
    userName: new RegExp(`^${details.userName}$`, "i"),
  });
  if (existingUsername !== null) {
    response.requestStatus = "RJCT";
    response.errMsg = "Username is not available";
    return response;
  }

  let existingEmail = await UserModel.findOne({
    email: new RegExp(`^${details.email}$`, "i"),
  });
  if (existingEmail !== null) {
    response.requestStatus = "RJCT";
    response.errMsg = "Email is not available";
    return response;
  }

  let passwordCheck = await isValidPassword(details.password);
  if (!passwordCheck.valid) {
    response.requestStatus = "RJCT";
    response.errMsg = passwordCheck.errMsg;
    return response;
  }

  const salt = genSalt();
  const hashedPassword = genHash(details.password, salt);

  let user = new UserModel({
    status: "ACTV",
    userName: details.userName,
    email: details.email,
    password: hashedPassword,
    salt: salt,
    userType: details.userType,
    phoneNumber: details.phoneNumber,
    firstName: details.firstName,
    lastName: details.lastName,
  });
  await user
    .save()
    .then(() => {
      response.requestStatus = "ACTC";
    })
    .catch((error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
    });
  return response;
};

export const adminUpdateUser = async function (userId, details) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(userId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "User Id is required.";
    return response;
  }

  let valid = userValidation(details);
  if (valid.requestStatus !== "ACTC") {
    return valid;
  }

  const existingUser = await UserModel.findOne({ _id: new ObjectId(userId) });
  if (existingUser === null) {
    response.requestStatus = "RJCT";
    response.errMsg = "User is not found";
    return response;
  }

  if (existingUser.userName !== details.userName) {
    const existingUsername = await UserModel.findOne({
      userName: new RegExp(`^${details.userName}$`, "i"),
    });
    if (existingUsername !== null) {
      response.requestStatus = "RJCT";
      response.errMsg = "Username is not available";
      return response;
    }
  }

  if (existingUser.email !== details.email) {
    const existingEmail = await UserModel.findOne({
      userName: new RegExp(`^${details.email}$`, "i"),
    });
    if (existingEmail !== null) {
      response.requestStatus = "RJCT";
      response.errMsg = "Email is not available";
      return response;
    }
  }

  let salt = existingUser.salt;
  let hashedPassword = existingUser.password;
  if (hashedPassword !== details.password) {
    let passwordCheck = await isValidPassword(details.password);
    if (!passwordCheck.valid) {
      response.requestStatus = "RJCT";
      response.errMsg = passwordCheck.errMsg;
      return response;
    }
    salt = genSalt();
    hashedPassword = genHash(details.password, salt);
  }

  let user = await UserModel.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        status: details.status,
        userName: details.userName,
        email: details.email,
        password: hashedPassword,
        salt: salt,
        userType: details.userType,
        phoneNumber: details.phoneNumber,
        firstName: details.firstName,
        lastName: details.lastName,
        successfulLoginDetails: details.successfulLoginDetails,
        failedLoginDetails: details.failedLoginDetails,
        detailsOTP: details.detailsOTP,
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

export const adminDeleteUser = async function (userId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(userId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "User Id is required.";
    return response;
  }

  const user = await UserModel.deleteOne({ _id: new ObjectId(userId) });
  if (user.deletedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Account deletion was not successful";
    return response;
  }

  response.requestStatus = "ACTC";
  return response;
};

const userValidation = function (details) {
  let response = { requestStatus: "", errField: "", errMsg: "" };
  if (!details.userName || details.userName === "") {
    response.requestStatus = "RJCT";
    response.errMsg = "Username is required";
    return response;
  }
  if (!details.password || details.password === "") {
    response.requestStatus = "RJCT";
    response.errMsg = "Password is required";
    return response;
  }
  if (!details.userType || details.userType === "") {
    response.requestStatus = "RJCT";
    response.errMsg = "Role is required";
    return response;
  }
  if (!details.email || details.email === "") {
    response.requestStatus = "RJCT";
    response.errMsg = "Email is required";
    return response;
  }
  if (!details.firstName || details.firstName === "") {
    response.requestStatus = "RJCT";
    response.errMsg = "First name is required";
    return response;
  }
  if (!details.lastName || details.lastName === "") {
    response.requestStatus = "RJCT";
    response.errMsg = "Last name is required";
    return response;
  }
  response.requestStatus = "ACTC";
  return response;
};

export const adminGetRooms = async function () {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let allRooms = await RoomModel.aggregate([
    {
      $project: {
        roomId: "$_id",
        _id: 0,
        roomName: 1,
        shortDesc: 1,
        description: 1,
        basePrice: 1,
        maxPax: 1,
        dspPriority: 1,
      },
    },
    {
      $sort: { dspPriority: 1 },
    },
  ]);
  
  if (allRooms.length === 0) {
    response.requestStatus = "ACTC";
    response.errMsg = "No data found";
    response.details = [];
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = allRooms;
  return response;
};

export const adminGetRoomDetails = async function (roomId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(roomId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Room Id is required.";
    return response;
  }

  let room = await RoomModel.findOne({ _id: new ObjectId(roomId) }).catch(
    (error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
      return response;
    }
  );

  if (room === null) {
    response.requestStatus = "RJCT";
    response.errMsg = "No data found";
    response.details = {};
    return response;
  }

  room = {
    roomName: room.roomName,
    shortDesc: room.shortDesc,
    description: room.description,
    basePrice: room.basePrice,
    maxPax: room.maxPax,
    dspPriority: room.dspPriority,
    createdBy: room.createdBy,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };

  response.requestStatus = "ACTC";
  response.details = room;
  return response;
};

export const adminCreateRoom = async function (details) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let valid = await roomValidation(null, details, "NEW");
  if (valid.requestStatus !== "ACTC") {
    return valid;
  }

  let newRoom = new RoomModel({
    roomName: details.roomName,
    shortDesc: details.shortDesc,
    description: details.description,
    basePrice: details.basePrice,
    maxPax: details.maxPax,
    dspPriority: details.dspPriority,
    createdBy: new ObjectId(valid.roomCreator),
  });
  await newRoom
    .save()
    .then(() => {
      response.requestStatus = "ACTC";
      response.room = newRoom;
    })
    .catch((error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
    });
  return response;
};

export const adminUpdateRoom = async function (roomId, details) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(roomId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Room Id is required.";
    return response;
  }

  let valid = await roomValidation(roomId, details, "CHG");
  if (valid.requestStatus !== "ACTC") {
    return valid;
  }
  
  let room = await RoomModel.updateOne(
    { _id: new ObjectId(roomId) },
    {
      $set: {
        roomName: details.roomName,
        shortDesc: details.shortDesc,
        description: details.description,
        basePrice: details.basePrice,
        maxPax: details.maxPax,
        dspPriority: details.dspPriority,
        createdBy: new ObjectId(valid.roomCreator),
      },
    }
  );
  if (room.modifiedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Room update was not successful";
    return response;
  }

  response.requestStatus = "ACTC";
  return response;
};

export const adminDeleteRoom = async function (roomId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(roomId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Room Id is required.";
    return response;
  }

  const room = await RoomModel.deleteOne({ _id: new ObjectId(roomId) });
  if (room.deletedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Room deletion was not successful";
    return response;
  }

  response.requestStatus = "ACTC";
  return response;
};

const roomValidation = async function (roomId, details, requestType) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (requestType != "NEW" && requestType != "CHG" && requestType != "DEL") {
    response.errMsg = "Request type is invalid.";
    response.requestStatus = "RJCT";
    return response;
  }

  let oldRoomObject;
  if (requestType !== "NEW") {
    oldRoomObject = await RoomModel.findOne({ _id: new ObjectId(roomId) });
    if (!oldRoomObject) {
      response.errMsg = "Room is not found.";
      response.errField = "roomName";
      response.requestStatus = "RJCT";
      return response;
    }
  }
  if (details.roomName.trim() === "") {
    response.errMsg = "Room name is required.";
    response.errField = "roomName";
    response.requestStatus = "RJCT";
    return response;
  }
  if (requestType !== "DEL") {
    let otherRoomObject = await RoomModel.findOne({
      roomName: details.roomName.trim(),
    });
    if (otherRoomObject) {
      if (
        requestType === "NEW" ||
        (requestType === "CHG" &&
          !otherRoomObject._id.equals(new ObjectId(oldRoomObject._id)))
      ) {
        response.errMsg = "Room name is already used.";
        response.errField = "roomName";
        response.requestStatus = "RJCT";
        return response;
      }
    }
  }
  if (requestType !== "DEL" && details.shortDesc.trim() === "") {
    response.errMsg = "Short description is required.";
    response.errField = "shortDesc";
    response.requestStatus = "RJCT";
    return response;
  }
  if (requestType !== "DEL" && details.description.trim() === "") {
    response.errMsg = "Description is required.";
    response.errField = "description";
    response.requestStatus = "RJCT";
    return response;
  }
  if (details.maxPax < 1 || isNaN(details.maxPax)) {
    response.errMsg = "Maximum number of guests must be at least 1.";
    response.errField = "maxPax";
    response.requestStatus = "RJCT";
    return response;
  }

  if (
    requestType != "DEL" &&
    (details.dspPriority < 1 || isNaN(details.dspPriority))
  ) {
    response.errMsg = "Display priority is required";
    response.errField = "dspPriority";
    response.requestStatus = "RJCT";
    return response;
  }
  if (
    requestType === "NEW" &&
    (details.newCreatorId === "" || details.newCreatorId === null)
  ) {
    response.errMsg = "Room creator is required";
    response.errField = "newCreatorId";
    response.requestStatus = "RJCT";
    return response;
  }

  let roomCreator =
    requestType == "NEW" ? details.newCreatorId : details.createdBy;
  if (details.newCreatorId && details.newCreatorId !== "") {
    if (!mongoose.isValidObjectId(details.newCreatorId.trim())) {
      response.requestStatus = "RJCT";
      response.errField = "newCreatorId";
      response.errMsg = "Invalid room creator";
      return response;
    } else {
      roomCreator = details.newCreatorId;
    }
  }

  let isValidUser = await getAccountDetails(roomCreator);
  if (isValidUser === null || isValidUser._id === "") {
    response.requestStatus = "RJCT";
    response.errField = "newCreatorId";
    response.errMsg = "Invalid room creator";
    return response;
  }

  response.requestStatus = "ACTC";
  response.roomCreator = roomCreator;
  return response;
};

export const adminGetParms = async function () {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let allParms = await SystemParameterModel.find();

  if (allParms.length === 0) {
    response.requestStatus = "ACTC";
    response.errMsg = "No data found";
    response.details = [];
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = allParms;
  return response;
};

export const adminGetParmDetails = async function (parmId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(parmId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Parameter Id is required.";
    return response;
  }

  let parm = await SystemParameterModel
    .findOne(
      { _id: new ObjectId(parmId) },
      { createdBy: 0, createdAt: 0, updatedAt: 0 }
    )
    .catch((error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
      return response;
    });

  if (parm === null) {
    response.requestStatus = "RJCT";
    response.errMsg = "No data found";
    response.details = {};
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = parm;
  return response;
};

export const adminCreateParm = async function (details) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let newParm = new SystemParameterModel({ ...details });
  await newParm
    .save()
    .then(() => {
      response.requestStatus = "ACTC";
      response.parm = newParm;
    })
    .catch((error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
    });
  return response;
};

export const adminUpdateParm = async function (parmId, details) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(parmId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Parameter Id is required.";
    return response;
  }

  let parm = await SystemParameterModel.updateOne(
    { _id: new ObjectId(parmId) },
    {
      ...details,
    }
  );
  if (parm.modifiedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Parameter update was not successful";
    return response;
  }

  response.requestStatus = "ACTC";
  return response;
};

export const adminDeleteParm = async function (parmId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(parmId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Parameter Id is required.";
    return response;
  }

  const parm = await SystemParameterModel.deleteOne({
    _id: new ObjectId(parmId),
  });
  if (parm.deletedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Parameter deletion was not successful";
    return response;
  }

  response.requestStatus = "ACTC";
  return response;
};
