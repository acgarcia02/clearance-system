const express = require("express");
const router = express.Router();
const fs = require("fs");
const { google } = require("googleapis");
const multer = require("multer");
const credentials = require("../apikey.json");

const User = require("../models/user");

const scope = ["https://www.googleapis.com/auth/drive"];

const authorizeUpload = async () => {
  const jwtClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scope
  );
  await jwtClient.authorize();
  return jwtClient;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/");
  },
});
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const user = await User.findById(req.user._id).lean();

    const authClient = await authorizeUpload();
    const drive = google.drive({ version: "v3", auth: authClient });

    const driveFile = await drive.files.create({
      requestBody: {
        name: `${user.studentDetails.studentNumber}-ID.jpg`,
        parents: ["1LgyI5ZK0Lclb81HYIHlF2K4gCTXrg1Bm"],
        mimeType: "image/jpeg",
      },
      media: {
        mimeType: "image/jpeg",
        body: fs.createReadStream(file.path),
      },
    });

    console.log(driveFile.data.id);

    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { "studentDetails.uploadedID": driveFile.data.id } },
      { new: true }
    );

    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Deleted");
    });

    res.send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in file upload");
  }
});

module.exports = router;
