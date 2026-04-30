import mongoose from "mongoose";
import PhotoModel from "../models/photo.model.js";

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
