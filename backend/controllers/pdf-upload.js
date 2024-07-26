require("dotenv").config();

const express = require("express");
const router = express.Router();
const fs = require("fs");
const { google } = require("googleapis");
const multer = require("multer");
const credentials = require("../apikey.json");

const Request = require("../models/request");
const Notification = require("../models/notification");
const User = require("../models/user");
const Status = require("../models/status");
const { transporter } = require("./mailer");

const scope = ["https://www.googleapis.com/auth/drive"];

const sendEmailNotif = (recipient, subject, body) => {
  if (recipient && recipient.allowNotifs) {
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: recipient.email,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });
  }
};

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
    const requestId = req.body.requestId;
    const request = await Request.findById(requestId)
      .populate("student")
      .lean();

    const authClient = await authorizeUpload();
    const drive = google.drive({ version: "v3", auth: authClient });

    if (request.file) {
      await drive.files.update({
        fileId: request.file,
        media: {
          mimeType: file.mimetype,
          body: fs.createReadStream(file.path),
        },
      });
    }

    await Request.findByIdAndUpdate(
      requestId,
      { $set: { isSigned: true, isReviewed: -1 } },
      { new: true }
    );

    await Status.findByIdAndUpdate(
      request.status[8]._id,
      { $set: { status: "Pending", remarks: "No Remarks" } },
      { new: true }
    );

    const recipients = await User.find({ role: "admin" }).lean();
    const title = "New application";
    const content = `${request.student.studentDetails.lastName}, ${request.student.studentDetails.firstName} ${request.student.studentDetails.middleName} (${request.student.studentDetails.studentNumber}) has applied for clearance.`;
    const notifications = recipients.map((recipient) => ({
      title,
      content,
      recipient: recipient._id,
    }));
    await Notification.insertMany(notifications);

    recipients.forEach((recipient) => {
      sendEmailNotif(
        recipient,
        "[CAS Clearance] New Clearance Application Received",
        `Good day!\n\nA new clearance application has been submitted by ${request.student.studentDetails.lastName}, ${request.student.studentDetails.firstName} ${request.student.studentDetails.middleName} (${request.student.studentDetails.studentNumber}). Please review the application and take the necessary actions.\n\nBest regards,\nCAS College Clearance System`
      );
    });

    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Deleted");
    });

    res.send({ success: true, request: request });
  } catch (error) {
    console.error(error);
    res.send({
      success: false,
      message: "There was an error in uploading the file.",
    });
  }
});

router.post("/view", async (req, res) => {
  try {
    const fileId = req.body.fileId;

    const authClient = await authorizeUpload();
    const drive = google.drive({ version: "v3", auth: authClient });

    res.setHeader("Content-Type", "application/pdf");
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );
    response.data.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching file from Google Drive");
  }
});

module.exports = router;
