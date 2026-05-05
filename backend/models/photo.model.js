import { model, Schema } from "mongoose";

const photoSchema = Schema(
  {
    imagePage: { type: String, required: true },
    pathName: { type: String, required: true},
    imageDesc: String,
    dspPriority: Number,
    imageURL: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

export default model("photo", photoSchema);
