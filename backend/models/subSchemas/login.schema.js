import { Schema } from "mongoose";

const loginSchema = Schema({
  _id: false,
  numberOfLoginDtlsToKeep: Number,
  defaultLoginTries: Number,
  maxAdditionalLoginTries: Number,
  lockedAccountTiming: Number,
  otpExpiry: Number,
  minPasswordLength: Number,
  passwordCriteria: {
    _id: false,
    capitalLetterIsRequired: Boolean,
    capitalLettersList: String,
    specialCharacterIsRequired: Boolean,
    specialCharsList: String,
    numberIsRequired: Boolean,
    numbersList: String,
  },
});

export default loginSchema;
