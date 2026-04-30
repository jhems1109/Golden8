import { Schema, model } from "mongoose";
import loginSchema from "./subSchemas/login.schema.js";
import defaultMsgSchema from "./subSchemas/defaultMsg.schema.js";

const sysParamSchema = Schema(
  {
    parameterId: { type: String, required: true },
    login: loginSchema,
    notification_type: defaultMsgSchema,
    textDisplays: {
      _id: false,
      pageName: { type: String },
      message1: { type: String },
      message2: { type: String },
      message3: { type: String },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

export default model("systemParameter", sysParamSchema);
