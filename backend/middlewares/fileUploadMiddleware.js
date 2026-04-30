import multer from "multer";
import fs from "fs";

const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `public/images/profilepictures/`;

    if (!fs.existsSync(folder)) {
      //// Create folder if it doesn't exist yet
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id.toString()}.jpeg`);
  },
});

const storageRoomLogo = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `public/images/logos/`;

    if (!fs.existsSync(folder)) {
      //// Create folder if it doesn't exist yet
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    console.log(req.body.roomName);
    cb(null, `${req.body.roomName.trim()}.jpeg`);
  },
});


const storagePagePhoto = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `public/images/${req.body.imagePage}/`;

    if (!fs.existsSync(folder)) {
      //// Create folder if it doesn't exist yet
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.jpeg`);
  },
});

export const updateProfilePic = async (req, res, next) => {
  const setProfilePic = multer({ storage: storageProfile }).single("image");
  setProfilePic(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log("Multer err instance while uploading photo : " + err);
    } else if (err) {
      console.log("Multer err while uploading photo : " + err);
    } else if (!req.file && req.body.imageChanged === "true") {
      const fileName = `public/images/profilepictures/${req.user._id.toString()}.jpeg`;
      if (fs.existsSync(fileName)) {
        fs.unlink(fileName, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return;
          }
          console.log("File removed successfully");
        });
      }
    }
  });
  next();
};

export const updateRoomLogo = async (req, res, next) => {
  const setRoomLogo = multer({ storage: storageRoomLogo }).single("logo");
  setRoomLogo(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log("Multer err instance while uploading photo : " + err);
    } else if (err) {
      console.log("Multer err while uploading photo : " + err);
    } else if (!req.file && req.body.logoChanged === "true") {
      const fileName = `public/images/logos/${req.body.roomName.trim()}.jpeg`;
      if (fs.existsSync(fileName)) {
        fs.unlink(fileName, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return;
          }
          console.log("File removed successfully");
        });
      }
    }
    next();
  });
};

export const deleteRoomLogo = async (req, res, next) => {
  const setRoomLogo = multer({ storage: storageRoomLogo }).single("logo");
  setRoomLogo(req, res, function (err) {
    const fileName = `public/images/logos/${req.body.roomName.trim()}.jpeg`;
    if (fs.existsSync(fileName)) {
      fs.unlink(fileName, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return;
        }
        console.log("File removed successfully");
      });
    }
    next();
  });
};

export const createPagePhotos = async (req, res, next) => {
  const setPagePhotos = multer({ storage: storagePagePhoto }).single("image");
  setPagePhotos(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log("Multer err instance while uploading photo : " + err);
      return;
    } else if (err) {
      console.log("Multer err while uploading photo : " + err);
      return;
    }
    req.body.pathName = `/images/${req.body.imagePage}/${req.file.filename}`
    next();
  });
};

export const deletePagePhotos = async (req, res, next) => {
  const setPagePhotos = multer({ storage: storagePagePhoto }).single("image");
  setPagePhotos(req, res, function (err) {
    const fileName = `public${req.body.pathName.trim()}`;
    if (fs.existsSync(fileName)) {
      fs.unlink(fileName, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return;
        }
        console.log("File removed successfully");
      });
    }
    next();
  });
};
