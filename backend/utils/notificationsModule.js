import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import SystemParameterModel from "../models/systemParameter.model.js";
import RoomModel from "../models/room.model.js";

import {
  getNotifParmByNotifId,
  getSysParmById,
  getSysParmList,
} from "./sysParmModule.js";

let ObjectId = mongoose.Types.ObjectId;

export const getUserNotifications = async function (userId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (!mongoose.isValidObjectId(userId.trim())) {
    response.requestStatus = "RJCT";
    response.errMsg = "User id required";
    return response;
  }

  let notifs = await UserModel.findOne(
    { _id: new ObjectId(userId) },
    { _id: 0, notifications: 1 }
  );
  if (notifs === null) {
    response.requestStatus = "RJCT";
    response.errMsg = "User is not found.";
    return response;
  }
  if (!notifs.notifications || !notifs.notifications.length === 0) {
    response.requestStatus = "ACTC";
    response.details = [];
    return response;
  }

  notifs = notifs.notifications;
  let notifParms = await getSysParmList("notification_type");
  if (notifParms.requestStatus !== "ACTC" || notifParms.data.length === 0) {
    response.requestStatus = "ACTC";
    response.details = [];
    return response;
  }

  let promise = notifs.map(async (notif) => {
    let notifDetail = {
      notifId: notif._id,
      readStatus: notif.readStatus,
      notificationType: notif.notificationType,
      creationDate: notif.createdAt,
    };
    let index = notifParms.data.findIndex((parm) =>
      parm._id.equals(notif.notificationType)
    );
    if (index !== -1) {
      let notifFormat = notifParms.data[index].notification_type;
      if (notifFormat.infoOrApproval && notifFormat.infoOrApproval !== "INFO") {
        if (
          notif.forAction.actionDone === "APRV" ||
          notif.forAction.actionDone === "RJCT"
        ) {
          if (notifFormat.infoOrApproval === "APRV") {
            notifDetail.displayApproveButton = true;
          } else if (notifFormat.infoOrApproval === "APRVREJ") {
            notifDetail.displayApproveButton = true;
            notifDetail.displayRejectButton = true;
          }
        } else {
          let reqDetails = await getRequestStatus(
            notif.forAction.requestId.toString()
          );
          if (reqDetails.requestStatus === "ACTC") {
            if (reqDetails.details.requestStatus === "PEND") {
              if (notifFormat.infoOrApproval === "APRV") {
                notifDetail.enableApproveButton = true;
              } else if (notifFormat.infoOrApproval === "APRVREJ") {
                notifDetail.enableApproveButton = true;
                notifDetail.enableRejectButton = true;
              }
            } else {
              if (notifFormat.infoOrApproval === "APRV") {
                notifDetail.displayApproveButton = true;
              } else if (notifFormat.infoOrApproval === "APRVREJ") {
                notifDetail.displayApproveButton = true;
                notifDetail.displayRejectButton = true;
              }
            }
          }
        }
      }
      notifDetail.message = notif.notificationMsg;
    }
    return { ...notifDetail };
  });

  notifs = await Promise.all(promise);
  response.requestStatus = "ACTC";
  response.details = notifs.sort((a, b) => b.creationDate - a.creationDate);
  return response;
};

export const genNotifMsg = async function (notifId, senderName, extraMsg) {
  let notifParm = await getNotifParmByNotifId(notifId);
  if (notifParm.requestStatus !== "ACTC") {
    return "";
  }
  let notifMsg = notifParm.data.notification_type.message;
  //let promise1 = getUserFullname(senderUserId, "")
  //let promise2 = getTeamName(senderTeamId)
  //let promise3 = getRoomMajorDetails(senderRoomId)
  //let [senderUserDetail, senderTeamName, senderRoomDetail] = await Promise.all([promise1, promise2, promise3])

  if (notifMsg.indexOf("&senderName") !== -1) {
    notifMsg = formatNotifMsg(
      notifMsg,
      "&senderUserName",
      senderUserDetail.fullName
    );
  }
  if (notifMsg.indexOf("&senderTeamName") !== -1) {
    notifMsg = formatNotifMsg(notifMsg, "&senderTeamName", senderTeamName);
  }
  if (notifMsg.indexOf("&senderRoomName") !== -1) {
    notifMsg = formatNotifMsg(
      notifMsg,
      "&senderRoomName",
      senderRoomDetail.roomName
    );
  }
  if (notifMsg.indexOf("&matchDetails") !== -1) {
    notifMsg = formatNotifMsg(notifMsg, "&matchDetails", matchDetails);
  }
  if (notifMsg.indexOf("&extraMsg") !== -1) {
    if (extraMsg !== null && extraMsg !== "") {
      notifMsg = formatNotifMsg(notifMsg, "&extraMsg", extraMsg);
    } else {
      notifMsg = formatNotifMsg(notifMsg, "&extraMsg", " ");
    }
  }
  return notifMsg;
};

/*const formatNotifMsg = function(message, fromKeyword, toName) {
    if (message === "" || fromKeyword === "" || toName === "") {
        return message
    }
    let startString = ""
    let endString = ""
    let startPos = message.indexOf(fromKeyword)
    if (startPos === -1) {
        return message
    }
    let endPos = message.indexOf(" ", startPos)
    if (startPos > 0) {
        startString = message.substring(0,startPos)
    }
    if (endPos > 0 && endPos !== -1) {
        endString = message.substring(endPos)
    }
    return startString + toName + endString
}*/

export const getUnreadNotifsCount = async function (userId) {
  if (!mongoose.isValidObjectId(userId.trim())) {
    return 0;
  }

  let unreadNotifs = await UserModel.aggregate([
    {
      $match: { _id: new ObjectId(userId) },
    },
    {
      $addFields: {
        count: {
          $reduce: {
            input: "$notifications",
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                { $cond: [{ $eq: ["$$this.readStatus", false] }, 1, 0] },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        count: 1,
      },
    },
  ]);
  if (unreadNotifs === null || unreadNotifs[0].count === null) {
    return 0;
  } else {
    return unreadNotifs[0].count;
  }
};

export const readUnreadNotif = async function (userId, notifId) {
  let response = { requestStatus: "", errField: "", errMsg: "" };

  if (
    !mongoose.isValidObjectId(userId.trim()) ||
    !mongoose.isValidObjectId(notifId.trim())
  ) {
    response.requestStatus = "RJCT";
    response.errMsg = "Invalid entry parameters";
    return response;
  }

  let notif = await UserModel.findOne(
    { _id: new ObjectId(userId), "notifications._id": new ObjectId(notifId) },
    {
      "notifications.$": 1,
      _id: 0,
    }
  );

  if (!notif) {
    response.requestStatus = "RJCT";
    response.errMsg = "No notification found";
    return response;
  }

  let notifUpdate = await UserModel.updateOne(
    { _id: new ObjectId(userId), "notifications._id": new ObjectId(notifId) },
    {
      $set: {
        "notifications.$[n1].readStatus": !notif.notifications[0].readStatus,
      },
    },
    { arrayFilters: [{ "n1._id": new ObjectId(notifId) }] }
  );

  if (notifUpdate.modifiedCount !== 1) {
    response.requestStatus = "RJCT";
    response.errMsg = "Notification not updated";
    return response;
  } else {
    response.requestStatus = "ACTC";
    return response;
  }
};

export const processContactUsMsgs = async function (msgBody) {
  let fullName = msgBody.fullName;
  let email = msgBody.email;
  let msg = msgBody.msg;
  let notifMsg = `Full Name: ${fullName}, email: ${email}, msg: ${msg}`;
  let newNotif = await getNotifParmByNotifId("NTFCTCT");
  await UserModel.updateMany(
    //{ userType: "ADMIN" },
    {
      $push: {
        notifications: {
          readStatus: false,
          notificationType: newNotif.data._id,
          notificationMsg: notifMsg,
        },
      },
    }
  );
  return "";
};

export const housekeepNotifications = async function () {
  let parms = await SystemParameterModel
    .findOne({ parameterId: "notification_type" }, { notification_type: 1 })
    .exec();
  let notifHousekeeping = parms.notification_type.notifHousekeeping;
  let housekeepDate = getTimestamp(notifHousekeeping * -1);
  await UserModel.updateMany(
    { "notifications.createdAt": { $lte: housekeepDate } },
    {
      $pull: {
        notifications: {
          createdAt: { $lte: housekeepDate },
        },
      },
    }
  );
  return;
};

const getTimestamp = (daysToAdd) => {
  let date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date;
};
