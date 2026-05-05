import { model, Schema } from "mongoose";
import notificationsSchema from "./subSchemas/notification.schema.js";

const userSchema = Schema(
  {
    status: {
      type: String,
      enum: ["PEND", "ACTV", "LOCKED"],
      required: true,
    },
    userName: { type: String, unique: true, required: true, index: true },
    email: { type: String, unique: true, required: true, index: true },
    password: { type: String, required: true },
    salt: { type: String, unique: true, required: true },
    userType: { type: String, enum: ["USER", "ADMIN"], required: true },
    phoneNumber: String,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    imageURL: String,
    notifications: [notificationsSchema],
    successfulLoginDetails: [
      {
        _id: false,
        sourceIPAddress: {
          type: String,
        },
        timestamp: {
          type: Date,
        },
      },
    ],
    failedLoginDetails: {
      _id: false,
      numberOfLoginTries: Number,
      numberOfFailedLogins: Number,
      failedLogins: [
        {
          _id: false,
          sourceIPAddress: {
            type: String,
            required: () => {
              return this.failedLogins ? true : false;
            },
          },
          timestamp: {
            type: Date,
            required: () => {
              return this.sourceIPAddress ? true : false;
            },
          },
        },
      ],
      consecutiveLockedOuts: Number,
      lockedTimestamp: Date,
    },
    detailsOTP: {
      _id: false,
      OTP: Number,
      expiryTimeOTP: Date,
    },
  },
  {
    timestamps: true,
  }
);

function isRegular() {
  return this.userType == "USER" ? true : false;
}

export default model("user", userSchema);
