import multer from "multer";
import multerS3 from "multer-s3";
import { s3Storage } from "../config/s3-bucket.js";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const storageProfile = multerS3({
  s3: s3Storage,
  bucket: "golden8",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const fileName = `images/profilepictures/${req.user._id.toString()}.jpeg`;
    cb(null, fileName);
  },
});

const storageRoomLogo = multerS3({
  s3: s3Storage,
  bucket: "golden8",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const fileName = `images/logos/${req.body.roomName.trim()}.jpeg`;
    cb(null, fileName);
  },
});

const storagePagePhoto = multerS3({
  s3: s3Storage,
  bucket: "golden8",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    let fileName;
    if (req.method === "POST") {
      fileName = `images/${req.body.imagePage}/${Date.now()}.jpeg`;
    } else {
      fileName = req.body.pathName.trim();
    }
    cb(null, fileName);
  },
});

export const updateProfilePic = async (req, res, next) => {
  const setProfilePic = multer({ storage: storageProfile }).single("image");
  setProfilePic(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.log("Multer err instance while uploading photo : " + err);
    } else if (err) {
      console.log("Multer err while uploading photo : " + err);
    } else if (!req.file && req.body.imageChanged === "true") {
      req.body.imageURL = "";
      await s3Storage.send(
        new DeleteObjectCommand({
          Bucket: "golden8",
          Key: `images/profilepictures/${req.user._id.toString()}.jpeg`,
        }),
      );
    } else if (req.file && req.body.imageChanged === "true") {
      let path = req.file.key;
      req.body.imageURL = await getImagesURL(path);
    }
    next();
  });
};

export const deleteProfilePic = async (req, res, next) => {
  await s3Storage.send(
    new DeleteObjectCommand({
      Bucket: "golden8",
      Key: `images/profilepictures/${req.params.userid.trim()}.jpeg`,
    }),
  );
  next();
};

export const updateRoomLogo = async (req, res, next) => {
  const setRoomLogo = multer({ storage: storageRoomLogo }).single("logo");
  setRoomLogo(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.log("Multer err instance while uploading photo : " + err);
    } else if (err) {
      console.log("Multer err while uploading photo : " + err);
    } else {
      // if logo was removed
      if (!req.file && req.body.logoChanged === "true") {
        req.body.imageURL = "";
        await s3Storage.send(
          new DeleteObjectCommand({
            Bucket: "golden8",
            Key: `images/logos/${req.body.roomName.trim()}.jpeg`,
          }),
        );
        // if logo was changed and name was not changed, update image URL
      } else if (req.file && req.body.logoChanged === "true") {
        let path = req.file.key;
        req.body.imageURL = await getImagesURL(path);
      }
      // if logo was not changed when name was changed, copy old logo to new name before deleting old logo
      if (
        req.method === "PUT" &&
        req.body.oldName.trim() !== req.body.roomName.trim()
      ) {
        try {
          if (!req.file && req.body.logoChanged !== "true") {
            await s3Storage.send(
              new CopyObjectCommand({
                Bucket: "golden8",
                CopySource: `golden8/images/logos/${req.body.oldName.trim()}.jpeg`,
                Key: `images/logos/${req.body.roomName.trim()}.jpeg`,
              }),
            );
            let path = `images/logos/${req.body.roomName.trim()}.jpeg`;
            req.body.imageURL = await getImagesURL(path);
          }
          await s3Storage.send(
            new DeleteObjectCommand({
              Bucket: "golden8",
              Key: `images/logos/${req.body.oldName.trim()}.jpeg`,
            }),
          );
        } catch (err) {
          console.error(
            "Error occurred while copying/deleting logo with old name",
          );
        }
      }
    }
    next();
  });
};

export const deleteRoomLogo = async (req, res, next) => {
  try {
    await s3Storage.send(
      new DeleteObjectCommand({
        Bucket: "golden8",
        Key: `images/logos/${req.body.roomName.trim()}.jpeg`,
      }),
    );
  } catch (err) {
    console.log("No logo found to delete.");
  }
  // Delete any photos found with the room as imagePage
  // 1. List objects in the directory
  const listParams = {
    Bucket: "golden8",
    Prefix: `images/${req.body.roomName.trim()}/`,
  };

  const listedObjects = await s3Storage.send(
    new ListObjectsV2Command(listParams),
  );

  if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
    next();
  } else {
    // 2. Prepare objects for deletion
    const deleteParams = {
      Bucket: "golden8",
      Delete: { Objects: [] },
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    // 3. Delete the objects
    await s3Storage.send(new DeleteObjectsCommand(deleteParams));
    next();
  }
};

export const createPagePhotos = async (req, res, next) => {
  const setPagePhotos = multer({ storage: storagePagePhoto }).single("image");
  setPagePhotos(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.log("Multer err instance while uploading photo : " + err);
      return;
    } else if (err) {
      console.log("Multer err while uploading photo : " + err);
      return;
    } else if (req.file && req.body.imageChanged === "true") {
      let path = req.file.key;
      req.body.imageURL = await getImagesURL(path);
      req.body.pathName = path;
    }
    next();
  });
};

export const deletePagePhotos = async (req, res, next) => {
  await s3Storage
    .send(
      new DeleteObjectCommand({
        Bucket: "golden8",
        Key: req.body.pathName.trim(),
      }),
    )
    .then(next());
};

const getImagesURL = async (path) => {
  const url = await getSignedUrl(
    s3Storage,
    new GetObjectCommand({
      Bucket: "golden8",
      Key: path,
    }),
    { expiresIn: 172800 },
  ); //valid for 48 hours
  return url;
};
