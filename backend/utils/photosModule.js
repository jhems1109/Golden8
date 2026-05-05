import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import SystemParameterModel from "../models/systemParameter.model.js";
import RoomModel from "../models/room.model.js";
import PhotoModel from "../models/photo.model.js";
import { s3Storage } from "../config/s3-bucket.js";
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let ObjectId = mongoose.Types.ObjectId;

export const getPhotos = async function (imagePage) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let photos = await PhotoModel.aggregate([
    { $match: { imagePage: new RegExp(`^${imagePage.trim()}$`, "i") } },
    {
      $project: {
        photoId: "$_id",
        _id: 0,
        imagePage: 1,
        pathName: 1,
        imageDesc: 1,
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
    response.details = [];
    return response;
  });

  if (photos.length === 0) {
    response.requestStatus = "ACTC";
    response.errMsg = "No data found";
    response.details = [];
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = photos;
  return response;
};

export const getPhotoDetails = async function (photoId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  let photo = await PhotoModel.aggregate([
    { $match: { _id: new ObjectId(photoId) } },
  ])
    .limit(1)
    .catch((error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
      return response;
    });
  if (photo.length === 0) {
    response.requestStatus = "RJCT";
    response.errMsg = "No data found";
    response.details = {};
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = photo[0];
  return response;
};

export const createPhoto = async function (userId, data) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (data.dspPriority < 1 || isNaN(data.dspPriority)) {
    response.errMsg = "Display priority is required";
    response.errField = "dspPriority";
    response.requestStatus = "RJCT";
    return response;
  }
  let newPhoto = new PhotoModel({
    imagePage: data.imagePage.trim(),
    pathName: data.pathName.trim(),
    imageDesc: data.imageDesc.trim(),
    dspPriority: data.dspPriority,
    imageURL: data.imageURL,
    createdBy: new ObjectId(userId),
  });
  await newPhoto
    .save()
    .then(() => {
      response.requestStatus = "ACTC";
      response.photo = newPhoto;
    })
    .catch((error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
    });
  return response;
};

export const updatePhoto = async function (userId, photoId, data) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(photoId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Photo Id is required.";
    return response;
  }

  if (data.dspPriority < 1 || isNaN(data.dspPriority)) {
    response.errMsg = "Display priority is required";
    response.errField = "dspPriority";
    response.requestStatus = "RJCT";
    return response;
  }
  let updPhoto = await PhotoModel.updateOne(
    { _id: new ObjectId(photoId) },
    {
      $set: {
        imageDesc: data.imageDesc.trim(),
        dspPriority: data.dspPriority,
        //imageURL: data.imageURL,
        updatedBy: new ObjectId(userId),
      },
    },
  );
  if (updPhoto.modifiedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Photo update was not successful";
    return response;
  }

  response.requestStatus = "ACTC";
  return response;
};

export const deletePhoto = async function (userId, photoId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(photoId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "Photo Id is required.";
    return response;
  }

  const photo = await PhotoModel.deleteOne({ _id: new ObjectId(photoId) });
  if (photo.deletedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Photo deletion was not successful";
    return response;
  }

  return response;
};

export const updateImageURLs = async function () {
  let profilepictures = updateUrls("users");
  let logos = updateUrls("rooms");
  let rooms = updateUrls("photos");

  await Promise.all([profilepictures, logos, rooms]);
  return;
};

const updateUrls = async function (folder) {
  if (folder === "users") {
    let users = await UserModel.find();
    if (users.length > 0) {
      let promise = users.map(async (user) => {
        let path = `images/profilepictures/${user._id.toString()}.jpeg`;
        let url = await getImagesURL(path);
        let updUrl = await UserModel.updateOne(
          { _id: new ObjectId(user._id) },
          {
            $set: {
              imageURL: url,
            },
          },
        );
        return;
      });
    }
  } else if (folder === "rooms") {
    let rooms = await RoomModel.find();
    if (rooms.length > 0) {
      let promise = rooms.map(async (room) => {
        let path = `images/logos/${room.roomName.trim()}.jpeg`;
        let url = await getImagesURL(path);
        let updUrl = await RoomModel.updateOne(
          { _id: new ObjectId(room._id) },
          {
            $set: {
              imageURL: url,
            },
          },
        );
        return;
      });
    }
  } else if (folder === "photos") {
    let photos = await PhotoModel.find();
    if (photos.length > 0) {
      let promise = photos.map(async (photo) => {
        let path = photo.pathName.trim();
        let url = await getImagesURL(path);
        let updUrl = await PhotoModel.updateOne(
          { _id: new ObjectId(photo._id) },
          {
            $set: {
              imageURL: url,
            },
          },
        );
        return;
      });
    }
  }
};

const getImagesURL = async (path) => {
  const url = await getSignedUrl(
    s3Storage,
    new GetObjectCommand({
      Bucket: "golden8",
      Key: path,
    }),
    { expiresIn: 172800 },
  ); //valid for 48 hours
  return url;
};
