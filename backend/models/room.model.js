import { model, Schema } from "mongoose";

const roomSchema = Schema(
  {
    roomName: { type: String, required: true, index: true },
    shortDesc: String,
    description: String,
    basePrice: String,
    maxPax: Number,
    dspPriority: Number,
    imageURL: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

export default model("room", roomSchema);
