import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import cron from "node-cron"
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import { authenticate, getTokenFromCookies, adminAuthenticate } from "./middlewares/authMiddleware.js";
import { updateProfilePic, updateRoomLogo, deleteRoomLogo, createPagePhotos, deletePagePhotos} from "./middlewares/fileUploadMiddleware.js";
import userRoutes from "./routes/userRoutes.js";

import { getHomeDetails } from "./utils/homePageModule.js";
import { getSysParmList } from "./utils/sysParmModule.js";
import { getMyProfile, getAccountDetails, updateAccount, 
  changePassword, unlockAccounts, deletePendingAccounts } from "./utils/usersModule.js";
import { getRooms, getRoomDetailsAndButtons, createRoom, getRoomDetailsForUpdate, updateRoom, deleteRoom
  } from "./utils/roomsModule.js";
import { getPhotos, getPhotoDetails, createPhoto, updatePhoto, deletePhoto } from "./utils/photosModule.js";
import { getUnreadNotifsCount, getUserNotifications, readUnreadNotif, processContactUsMsgs, housekeepNotifications } from "./utils/notificationsModule.js";
import { adminGetUsers, adminGetUserDetails, adminCreateUser, adminUpdateUser, adminDeleteUser, 
  adminGetRooms, adminGetRoomDetails, adminCreateRoom, adminUpdateRoom,
  adminDeleteRoom, adminGetParms, adminGetParmDetails, adminCreateParm, adminUpdateParm, adminDeleteParm } from "./utils/adminModule.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 8000;

app.use(
  cors({
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-csrf-token",
      "Origin",
      "X-Api-Key",
      "X-Requested-With",
      "Accept",
      "X-XSRF-TOKEN",
      "XSRF-TOKEN",
    ],
    //origin: "https://golden8.netlify.app",
    origin: [
      //"http://127.0.0.1:5173",
      "https://golden8.netlify.app",
      //"http://localhost:5173",
    ],
    exposedHeaders: ["*", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use((req, res, next) => {
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);
app.use(express.static("public"));

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  getHomeDetails().then((data) => {
    res.json(data);
  });
});

app.get("/rooms", (req, res) => {
  getRooms().then((data) => {
    res.json(data);
  });
});

app.get("/amenities", (req, res) => {
  getPhotos('Amenities').then((data) => {
    res.json(data);
  });
});

app.get("/activities", (req, res) => {
  getPhotos('Activities').then((data) => {
    res.json(data);
  });
});
app.get("/gettextdisplays", (req, res) => {
  getSysParmList(req.query.parmid).then((data) => {
    res.json(data);
  });
});

app.post("/room/:roomid", getTokenFromCookies, (req, res) => {
  getRoomDetailsAndButtons(req.userId, req.params.roomid).then((data) => {
    res.json(data);
  });
});

app.post("/notifunreadcount", authenticate, (req, res) => {
  getUnreadNotifsCount(req.user._id.toString()).then((data) => {
    res.json(data);
  });
});

app.post("/notifications", authenticate, (req, res) => {
  getUserNotifications(req.user._id.toString()).then((data) => {
    res.json(data);
  });
});

app.put("/notificationsread/:notifid", authenticate, (req, res) => {
  readUnreadNotif(req.user._id.toString(), req.params.notifid).then((data) => {
    res.json(data);
  });
});

app.post("/myprofile", authenticate, (req, res) => {
  getMyProfile(req.user._id.toString())
  .then((data) => {
      res.json(data);
    }
  );
});

app.post("/getaccountdetails", authenticate, (req, res) => {
  getAccountDetails(req.user._id.toString()).then((data) => {
    res.json(data);
  });
});

app.post("/updateaccount", authenticate, updateProfilePic, (req, res) => {
  updateAccount(req.user._id.toString(), req.body).then((data) => {
    res.json(data);
  });
});

app.post("/admin", authenticate, (req, res) => {
  let roomId = req.query.room;
  if (roomId) {
    isRoomAdmin(req.user._id.toString(), roomId).then((data) => {
      res.json(data);
    });
  }
});

app.post("/createroom", authenticate, updateRoomLogo, (req, res) => {
  createRoom(req.user._id.toString(), req.body).then((data) => {
    res.json(data);
  });
});

app.post("/getroomdetailsupdate/:roomid", authenticate, (req, res) => {
  getRoomDetailsForUpdate(req.user._id.toString(), req.params.roomid).then(
    (data) => {
      res.json(data);
    }
  );
});

app.post("/updateroom/:roomid", authenticate, updateRoomLogo, (req, res) => {
  updateRoom(req.user._id.toString(), req.params.roomid, req.body).then(
    (data) => {
      res.json(data);
    }
  );
});

app.delete("/deleteroom/:roomid", authenticate, deleteRoomLogo, (req, res) => {
  deleteRoom(req.user._id.toString(), req.params.roomid).then((data) => {
    res.json(data);
  });
});

app.post("/changepassword", authenticate, (req, res) => {
  changePassword(req.user._id.toString(), req.body).then((data) => {
    res.json(data);
  });
});

app.post("/photoshome", authenticate, (req, res) => {
  getPhotos('Home').then((data) => {
    res.json(data);
  });
});

app.post("/photosamenities", authenticate, (req, res) => {
  getPhotos('Amenities').then((data) => {
    res.json(data);
  });
});

app.post("/photosactivities", authenticate, (req, res) => {
  getPhotos('Activities').then((data) => {
    res.json(data);
  });
});

app.post("/photosrooms", authenticate, (req, res) => {
  getPhotos(req.query.roomname).then((data) => {
    res.json(data);
  });
});

app.post("/getphotodetails/:photoid", authenticate, (req, res) => {
  getPhotoDetails(req.params.photoid).then((data) => {
    res.json(data);
  });
});

app.post("/photocreate", authenticate, createPagePhotos, (req, res) => {
  createPhoto(req.user._id.toString(), req.body).then((data) => {
    res.json(data);
  });
});

app.put("/photoupdate/:photoid", authenticate, (req, res) => {
  updatePhoto(req.user._id.toString(), req.params.photoid, req.body).then((data) => {
    res.json(data);
  });
});

app.delete("/photodelete/:photoid", authenticate, deletePagePhotos, (req, res) => {
  deletePhoto(req.user._id.toString(), req.params.photoid).then((data) => {
    res.json(data);
  });
});

app.post("/contactus", (req, res) => {
  processContactUsMsgs(req.body).then((data) => {
    res.json(data);
  });
});

app.post("/admingetusers", adminAuthenticate, (req, res) => {
  adminGetUsers().then((data) => {
    res.json(data);
  });
});

app.post("/admingetuser/:userid", adminAuthenticate, (req, res) => {
  adminGetUserDetails(req.params.userid).then((data) => {
    res.json(data);
  });
});

app.post("/admincreateuser", adminAuthenticate, updateProfilePic, (req, res) => {
  adminCreateUser(req.body).then((data) => {
    res.json(data);
  });
});

app.post("/adminupdateuser/:userid", adminAuthenticate, updateProfilePic, (req, res) => {
  adminUpdateUser(req.params.userid, req.body).then((data) => {
    res.json(data);
  });
});

app.delete("/admindeleteuser/:userid", adminAuthenticate, updateProfilePic, (req, res) => {
  adminDeleteUser(req.params.userid).then((data) => {
    res.json(data);
  });
});

app.post("/admingetrooms", adminAuthenticate, (req, res) => {
  adminGetRooms().then((data) => {
    res.json(data);
  });
});

app.post("/admingetroomdetails/:roomid", adminAuthenticate, (req, res) => {
  adminGetRoomDetails(req.params.roomid).then((data) => {
    res.json(data);
  });
});

app.post("/admincreateroom", adminAuthenticate, updateRoomLogo, (req, res) => {
  adminCreateRoom(req.body).then((data) => {
    res.json(data);
  });
});

app.post("/adminupdateroom/:roomid", adminAuthenticate, updateRoomLogo, (req, res) => {
  adminUpdateRoom(req.params.roomid, req.body).then((data) => {
    res.json(data);
  });
});

app.delete("/admindeleteroom/:roomid", adminAuthenticate, updateRoomLogo, (req, res) => {
  adminDeleteRoom(req.params.roomid).then((data) => {
    res.json(data);
  });
});

app.post("/admingetparms", adminAuthenticate, (req, res) => {
  adminGetParms().then((data) => {
    res.json(data);
  });
});

app.post("/admingetparmdetails/:parmid", adminAuthenticate, (req, res) => {
  adminGetParmDetails(req.params.parmid).then((data) => {
    res.json(data);
  });
});

app.post("/admincreateparm", adminAuthenticate, (req, res) => {
  adminCreateParm(req.body).then((data) => {
    res.json(data);
  });
});

app.post("/adminupdateparm/:parmid", adminAuthenticate, (req, res) => {
  adminUpdateParm(req.params.parmid, req.body).then((data) => {
    res.json(data);
  });
});

app.delete("/admindeleteparm/:parmid", adminAuthenticate, (req, res) => {
  adminDeleteParm(req.params.parmid).then((data) => {
    res.json(data);
  });
});

// Run job to unlock accounts every midnight
cron.schedule('0 0 * * *', () => {
  unlockAccounts()
  .then( console.log("Unlock accounts job ran."))
});

// Run job to delete pending accounts every 10mins
cron.schedule('0 0 * * *', () => {
  deletePendingAccounts()
  .then( console.log("Deletion of pending accounts job ran."))
});

// Run job to housekeep notifications every midnight
cron.schedule('0 0 * * *', () => {
  housekeepNotifications()
  .then( console.log("Notifications housekeeping job ran."))
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
