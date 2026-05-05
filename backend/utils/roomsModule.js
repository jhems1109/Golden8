import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import SystemParameterModel from "../models/systemParameter.model.js";
import RoomModel from "../models/room.model.js";
import PhotoModel from "../models/photo.model.js";
import { getPhotos } from "./photosModule.js";
import { s3Storage } from "../config/s3-bucket.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

let ObjectId = mongoose.Types.ObjectId;

export const getRooms = async function () {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let rooms = await RoomModel.aggregate([
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
        imageURL: 1,
      },
    },
    {
      $sort: { dspPriority: 1 },
    },
  ]).catch((error) => {
    response.requestStatus = "RJCT";
    response.errMsg = error;
    return response;
  });

  if (rooms.length === 0) {
    response.requestStatus = "ACTC";
    response.errMsg = "No data found";
    response.details = [];
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = rooms;
  return response;
};

export const getRoomDetailsAndButtons = async function (userId, roomId) {
  let room = getRoomDetails(roomId);
  let roomButtons = getRoomButtons(userId, roomId);

  let [roomDetails, roomButtonsInd] = await Promise.all([room, roomButtons]);
  roomDetails = { ...roomDetails, buttons: roomButtonsInd };

  let photos = await getPhotos(roomDetails.details.roomName);
  roomDetails = { ...roomDetails, photos: photos.details };

  return roomDetails;
};

export const getRoomDetails = async function (roomId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(roomId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Room Id is required.";
    return response;
  }

  let room = await RoomModel.aggregate([
    { $match: { _id: new ObjectId(roomId) } },
  ])
    .limit(1)
    .catch((error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
      return response;
    });
  if (room.length === 0) {
    response.requestStatus = "RJCT";
    response.errMsg = "No data found";
    response.details = {};
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = room[0];
  return response;
};

export const getRoomButtons = async function (userId, roomId) {
  let response = { displayUpdateButton: false };

  if (
    !mongoose.isValidObjectId(userId.trim()) ||
    !mongoose.isValidObjectId(roomId.trim())
  ) {
    return response;
  }

  let admin = await isRoomAdmin(userId, roomId);
  if (admin === true) {
    response.displayUpdateButton = true;
  }
  return response;
};

export const createRoom = async function (userId, data) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let validate = await roomValidation(data, "NEW", userId);

  if (validate.requestStatus !== "ACTC") {
    response = validate;
  } else {
    let newRoom = new RoomModel({
      roomName: data.roomName,
      shortDesc: data.shortDesc,
      description: data.description,
      basePrice: data.basePrice,
      maxPax: data.maxPax,
      dspPriority: data.dspPriority,
      imageURL: data.imageURL,
      createdBy: new ObjectId(userId),
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
  }
  return response;
};

export const getRoomDetailsForUpdate = async function (userId, roomId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };
  if (!mongoose.isValidObjectId(userId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "User Id is required.";
    return response;
  }
  if (!mongoose.isValidObjectId(roomId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Room Id is required.";
    return response;
  }
  let isRoomAdminInd = await isRoomAdmin(userId, roomId);
  if (!isRoomAdminInd) {
    response.requestStatus = "RJCT";
    response.errMsg = "Not authorized to this page !!!";
    return response;
  }
  let roomDetails = await getRoomDetails(roomId);

  if (roomDetails.requestStatus !== "ACTC") {
    response.requestStatus = "RJCT";
    response.errMsg = "Room is not found.";
    return response;
  } else {
    let detailsForUpdate = roomDetails.details;
    response.details = detailsForUpdate;
    return response;
  }
};

export const updateRoom = async function (userId, roomId, data) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  data.roomId = roomId;
  let validate = await roomValidation(data, "CHG", userId);

  if (validate.requestStatus !== "ACTC") {
    response = validate;
  } else {
    await RoomModel.updateOne(
      { _id: new ObjectId(roomId) },
      {
        $set: {
          roomName: data.roomName.trim(),
          shortDesc: data.shortDesc.trim(),
          description: data.description.trim(),
          basePrice: data.basePrice.trim(),
          maxPax: data.maxPax,
          dspPriority: data.dspPriority,
          imageURL: data.imageURL,
          updatedBy: new ObjectId(userId),
        },
      },
    )
      .then(async () => {
        // if name changed, update photos, paths and URLs as well
        if (validate.oldRoomObject.roomName.trim() !== data.roomName.trim()) {
          let oldRoomName = validate.oldRoomObject.roomName.trim();
          let photos = await PhotoModel.find({
            imagePage: new RegExp(`^${oldRoomName.trim()}$`, "i"),
          });
          if (photos.length > 0) {
            let promise = photos.map(async (photo) => {
              let newPath = photo.pathName.trim().replace(oldRoomName.trim(), data.roomName.trim());
              try {
                await s3Storage.send(
                  new CopyObjectCommand({
                    Bucket: "golden8",
                    CopySource: `golden8/${photo.pathName.trim()}`,
                    Key: newPath,
                  }),
                );        
                await s3Storage.send(
                  new DeleteObjectCommand({
                    Bucket: "golden8",
                    Key: photo.pathName.trim(),
                  }),
                );
              } catch (err) {
                console.log("Error occurred while copying/deleting photo with old name");
              }
              const url = await getSignedUrl(
                s3Storage,
                new GetObjectCommand({
                  Bucket: "golden8",
                  Key: newPath,
                }),
                { expiresIn: 172800 },
              );
              let updUrl = await PhotoModel.updateOne(
                { _id: new ObjectId(photo._id) },
                {
                  $set: {
                    imagePage: data.roomName.trim(),
                    pathName: newPath,
                    imageURL: url,
                  },
                },
              );
            });
            try {
              await s3Storage.send(
                new DeleteObjectCommand({
                  Bucket: "golden8",
                  Key: `images/${oldRoomName.trim()}/`,
                }),
              );
            } catch (err) {
              console.log("Error occurred while deleting photo directory with old name");
            }
          }
        }
      })
      .catch((error) => {
        response.requestStatus = "RJCT";
        response.errMsg = error;
        return response;
      });
  }
  response.requestStatus = "ACTC";
  return response;
};

export const deleteRoom = async function (userId, roomId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let data = { roomId };
  let validate = await roomValidation(data, "DEL", userId);

  if (validate.requestStatus !== "ACTC") {
    response = validate;
  } else {
    const room = await RoomModel.deleteOne({ _id: new ObjectId(roomId) });
    if (room.deletedCount !== 1) {
      response.requestStatus = "RJCT";
      response.errMsg = "Photo deletion was not successful";
      return response;
    }
    response.requestStatus = "ACTC";
    // Delete photos found
    const delDb = await PhotoModel.deleteMany({
      imagePage: {
        $regex: new RegExp(`^${validate.oldRoomObject.roomName.trim()}$`, "i"),
      },
    });
  }
  return response;
};

export const isRoomAdmin = async function (userId, roomId) {
  if (
    !mongoose.isValidObjectId(userId.trim()) ||
    !mongoose.isValidObjectId(roomId.trim())
  ) {
    return false;
  }
  /*let room = await RoomModel.findOne(
    { _id: new ObjectId(roomId) },
    { createdBy: 1, _id: 0 }
  ).exec();
  if (room === null) {
    return false;
  }
  if (room.createdBy.equals(new ObjectId(userId))) {
    return true;
  }
  return false;*/
  return true;
};

export const roomValidation = async function (data, requestType, userId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };
  let isRoomAdminInd = false;
  let oldRoomObject = null;
  if (requestType != "NEW" && requestType != "CHG" && requestType != "DEL") {
    response.errMsg = "Request type is invalid.";
    response.requestStatus = "RJCT";
    return response;
  }
  if (requestType !== "NEW") {
    oldRoomObject = await RoomModel.findOne({ _id: new ObjectId(data.roomId) });
    if (!oldRoomObject) {
      response.errMsg = "Room is not found.";
      response.requestStatus = "RJCT";
      return response;
    } else {
      response.oldRoomObject = oldRoomObject;
    }
  }
  if (requestType === "CHG") {
    isRoomAdminInd = await isRoomAdmin(userId, data.roomId);
    if (!isRoomAdminInd) {
      response.errMsg = "Not authorized to this page !!!";
      response.requestStatus = "RJCT";
      return response;
    }
  }
  if (requestType !== "DEL" && data.roomName.trim() === "") {
    response.errMsg = "Room name is required.";
    response.errField = "roomName";
    response.requestStatus = "RJCT";
    return response;
  }
  if (requestType !== "DEL") {
    let otherRoomObject = await RoomModel.findOne({
      roomName: data.roomName.trim(),
    });
    if (otherRoomObject) {
      if (
        requestType === "NEW" ||
        (requestType === "CHG" &&
          !otherRoomObject._id.equals(new ObjectId(oldRoomObject._id)))
      ) {
        response.errMsg = "Room name is already used.";
        response.requestStatus = "RJCT";
        return response;
      }
    }
  }
  if (requestType !== "DEL" && data.shortDesc.trim() === "") {
    response.errMsg = "Short description is required.";
    response.errField = "shortDesc";
    response.requestStatus = "RJCT";
    return response;
  }
  if (requestType !== "DEL" && data.description.trim() === "") {
    response.errMsg = "Description is required.";
    response.errField = "description";
    response.requestStatus = "RJCT";
    return response;
  }
  if (requestType != "DEL" && (data.maxPax < 1 || isNaN(data.maxPax))) {
    response.errMsg = "Maximum number of guests must be at least 1.";
    response.errField = "maxPax";
    response.requestStatus = "RJCT";
    return response;
  }
  if (
    requestType != "DEL" &&
    (data.dspPriority < 1 || isNaN(data.dspPriority))
  ) {
    response.errMsg = "Display priority is required";
    response.errField = "dspPriority";
    response.requestStatus = "RJCT";
    return response;
  }
  response.requestStatus = "ACTC";
  return response;
};
