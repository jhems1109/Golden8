import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
  let token;
  token = req.header("Authorization").replace("Bearer ", "");
  try {
    if (token && token !== null && token !== "null") {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
          res.status(404).send({ message: "Token invalid" });
          return;
        } else {
          return data;
        }
      });

      if (decoded) {
        const user = await User.findById(decoded.userId);
        req.user = user;
      }
      next();
    } else {
      res.status(404).send({ message: "Not authorized" });
    }
  } catch (error) {
    res.status(401).send({ message: "Invalid token!" });
  }
};

export const getTokenFromCookies = async (req, res, next) => {
  let token = req.header("Authorization").replace("Bearer ", "");
  let userId = "";
  if (token && token !== null && token !== "null") {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        return { userId: "" };
      } else {
        return data;
      }
    });
    userId = decoded.userId;
  }
  req.userId = userId;
  next();
};

export const adminAuthenticate = async (req, res, next) => {
  let token = req.header("Authorization").replace("Bearer ", "");
  try {
    if (token && (token !== null) & (token !== "null")) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
          res.status(404).send({ message: "Token invalid" });
          return;
        } else {
          return data;
        }
      });
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user.userType !== "ADMIN") {
          res.status(404).send({ message: "Not authorized" });
          return;
        } else {
          req.user = user;
          next();
        }
      }
    } else {
      res.status(404).send({ message: "Not authorized" });
    }
  } catch (error) {
    res.status(401).send({ message: "Invalid token!" });
  }
};
