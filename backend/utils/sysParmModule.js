import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import SystemParameterModel from "../models/systemParameter.model.js";
import RoomModel from "../models/room.model.js";

let ObjectId = mongoose.Types.ObjectId;

export const getSysParmById = async function (recordId) {
  if (!mongoose.isValidObjectId(recordId.trim())) {
    return "";
  } else {
    let data = await SystemParameterModel
      .findOne({ _id: new ObjectId(recordId) })
      .exec();
    if (data !== null) {
      return data;
    } else {
      return "";
    }
  }
};

export const getSysParmByParmId = async function (parmId) {
  let response = { requestStatus: "", errMsg: "", data: {} };
  if (parmId === null || parmId === "") {
    response.requestStatus = "RJCT";
    response.errMsg = "Type of parameter is required.";
    return response;
  } else {
    response.data = await SystemParameterModel
      .findOne({ parameterId: parmId })
      .exec();
    if (response.data !== null) {
      response.requestStatus = "ACTC";
    } else {
      response.requestStatus = "RJCT";
      response.errMsg = "Parameter is not found.";
    }
    return response;
  }
};

export const getSysParmList = async function (parmId) {
  let response = { requestStatus: "", errMsg: "", data: [] };
  if (parmId === null || parmId === "") {
    response.requestStatus = "RJCT";
    response.errMsg = "Type of parameter is required.";
    return response;
  } else {
    response.data = await SystemParameterModel
      .find({ parameterId: parmId })
      .exec();
    if (response.data.length !== 0) {
      response.requestStatus = "ACTC";
    } else {
      response.requestStatus = "RJCT";
      response.errMsg = "Parameter is not found.";
    }
    return response;
  }
};

export const getNotifParmByNotifId = async function (notifId) {
  let response = { requestStatus: "", errMsg: "", data: {} };
  if (notifId === null || notifId === "") {
    response.requestStatus = "RJCT";
    response.errMsg = "Notification Id is required.";
    return response;
  } else {
    response.data = await SystemParameterModel
      .findOne({
        parameterId: "notification_type",
        "notification_type.notifId": notifId,
      })
      .exec();
    if (response.data !== null) {
      response.requestStatus = "ACTC";
    } else {
      response.requestStatus = "RJCT";
      response.errMsg = "Parameter is not found.";
    }
    return response;
  }
};
