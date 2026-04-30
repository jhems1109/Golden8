import { model, Schema } from "mongoose";

const notificationsSchema = Schema(
  {
    readStatus: { type: Boolean, required: true },
    notificationType: {
      type: Schema.Types.ObjectId,
      ref: "system_parameter",
      required: true,
    },
    senderName: String,
    senderContact: String,
    notificationMsg: String,
    notificationDetails: String,
  },
  {
    timestamps: true,
  }
);

export default notificationsSchema;
