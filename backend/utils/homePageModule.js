import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import SystemParameterModel from "../models/systemParameter.model.js";
import RoomModel from "../models/room.model.js";
import { getPhotos } from "./photosModule.js";

export const getHomeDetails = async function () {
  let response = { requestStatus: "", errField: "", errMsg: "" };
  let resp1 = getTopRooms();
  let resp2 = getPhotos('Home');

  const [topRooms, pagePhotos] =
    await Promise.all([resp1, resp2]);
  if (topRooms !== null && pagePhotos !== null) {
    response.requestStatus = "ACTC";
    response.details = topRooms.details
    response.photos = pagePhotos.details
  } else {
    (response.requestStatus = "RJCT"), (response.errMsg = "Error encountered.");
  }
  return response;
};

export const getTopRooms = async function () {
  let response = { requestStatus: "", errField: "", errMsg: "" };
  let topRooms = await RoomModel.aggregate([
    {
      $project: {
        roomId: "$_id",
        _id: 0,
        roomName: 1,
        shortDesc: 1,
        dspPriority: 1,
        imageURL: 1,
      },
    },
    {
      $sort: { dspPriority: 1 },
    },
  ])
    .limit(10)
    .catch((error) => {
      response.requestStatus = "RJCT";
      response.errMsg = error;
      response.details = [];
      return response;
    });

  if (topRooms.length === 0) {
    response.requestStatus = "ACTC";
    response.errMsg = "No data found";
    response.details = [];
    return response;
  }

  response.requestStatus = "ACTC";
  response.details = topRooms;
  return response;
};
