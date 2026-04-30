import { Schema } from "mongoose";

const defaultMsgSchema = Schema({
  _id: false,
  notifId: {
    type: String,
    unique: false,
    required: validateSchemaProperty(this, "notification_type"),
    index: true,
  },
  notifDesc: {
    type: String,
    required: false,
  },
  notifHousekeeping: Number,
  message: {
    type: String,
  },
});

function validateSchemaProperty(ctx, property) {
  return ([ctx].parameterId = property ? true : false);
}

export default defaultMsgSchema;
