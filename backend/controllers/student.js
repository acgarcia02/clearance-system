const express = require("express");
const router = express.Router();
const { PDFDocument } = require("pdf-lib");
const { Readable } = require("stream");
const User = require("../models/user");
const Request = require("../models/request");
const Status = require("../models/status");
const { google } = require("googleapis");
const credentials = require("../apikey.json");
const scope = ["https://www.googleapis.com/auth/drive"];
const pdfData = require("./pdfData");

const createUnits = async (requestId) => {
  const collegeUnits = [
    "Institute of Biological Sciences",
    "Institute of Chemistry",
    "Institute of Computer Science",
    "Institute of Mathematical Sciences and Physics",
    "Institute of Statistics",
    "Department of Humanities",
    "Department of Social Sciences",
    "Department of Human Kinetics",
    "Office of the College Secretary",
  ];

  try {
    const statuses = [];
    for (const unit of collegeUnits) {
      const status = new Status({ collegeUnit: unit });
      await status.save();
      statuses.push(status._id);
    }

    await Request.findByIdAndUpdate(
      requestId,
      { $set: { status: statuses } },
      { new: true }
    );
  } catch (error) {
    console.error(`Error creating status for ${collegeUnit}:`, error);
    throw new Error("Error creating units");
  }
};

const createPDF = async (source, data) => {
  try {
    const pdf = await PDFDocument.load(source);
    const form = pdf.getForm();
    let fields = form.getFields();

    fields.forEach((field) => {
      const fieldType = field.constructor.name;
      const fieldName = field.getName();

      if (fieldName === "name") {
        const fullName = `${data.lname}, ${data.fname}, ${data.mname}`;
        form.getTextField(fieldName).setText(fullName);
      } else if (fieldName === "name_sign") {
        form.getTextField(fieldName).setText(data.adviser);
      } else if (fieldType === "PDFCheckBox") {
        if (fieldName === "grad" && data.reason === "Graduating") {
          form.getCheckBox(fieldName).check();
        } else if (fieldName === "shift" && data.reason === "Transferring") {
          form.getCheckBox(fieldName).check();
        } else if (fieldName === "first" && data.gradsem === "1st Semester") {
          form.getCheckBox(fieldName).check();
        } else if (fieldName === "second" && data.gradsem === "2nd Semester") {
          form.getCheckBox(fieldName).check();
        } else if (fieldName === "midyear" && data.gradsem === "Midyear") {
          form.getCheckBox(fieldName).check();
        }
      } else {
        form.getTextField(fieldName).setText(data[fieldName]);
      }
    });

    return await pdf.save();
  } catch (error) {
    console.error("Error creating PDF:", error);
    throw new Error("Error creating PDF");
  }
};

const authorizeUpload = async () => {
  try {
    const jwtClient = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      scope
    );
    await jwtClient.authorize();
    return jwtClient;
  } catch (error) {
    console.error("Error authorizing upload:", error);
    throw new Error("Error authorizing upload");
  }
};

router.post("/submit", async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;
    const data = req.body;
    data.email = user.email;

    const existingUser = await User.findOne({
      "studentDetails.studentNumber": data.studentno,
    });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      await User.findByIdAndDelete(userId);
      return res.status(400).send({
        success: false,
        message:
          "A request with this student number already exists. You can only make a single request.",
      });
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "studentDetails.lastName": data.lname,
          "studentDetails.firstName": data.fname,
          "studentDetails.middleName": data.mname,
          "studentDetails.studentNumber": data.studentno,
          "studentDetails.degreeProgram": data.degprog,
          "studentDetails.contact": data.mobileno,
          "studentDetails.address": data.address,
          "studentDetails.adviser": data.adviser,
        },
      },
      { new: true }
    );

    const request = new Request({
      student: userId,
      reason: data.reason,
      semester: data.gradsem,
      acadYear: data.gradyear,
      shiftTo: data.shiftto,
      isUPCampus: data.isUPCampus,
    });

    await request.save();
    await createUnits(request._id);

    const binaryData = Buffer.from(pdfData, "base64");
    const uint8Array = new Uint8Array(binaryData);
    const pdf = await createPDF(uint8Array, data);
    const pdfBuffer = Buffer.from(pdf);

    const authClient = await authorizeUpload();
    const drive = google.drive({ version: "v3", auth: authClient });

    const driveFile = await drive.files.create({
      requestBody: {
        name: `${data.studentno}-CAS-OCS-Form-No-016-College-Clearance.pdf`,
        parents: ["1LgyI5ZK0Lclb81HYIHlF2K4gCTXrg1Bm"],
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: Readable.from(pdfBuffer),
      },
    });

    await Request.findByIdAndUpdate(
      request._id,
      { $set: { file: driveFile.data.id } },
      { new: true }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${data.studentno} - CAS-OCS-Form-No-016-College-Clearance.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in form submission:", error);
    res
      .status(500)
      .send({ success: false, message: "Error in form submission" });
  }
});

router.patch("/edit", async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;
    const data = req.body;
    data.email = user.email;

    const existingUser = await User.findOne({
      "studentDetails.studentNumber": data.studentno,
    });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      await User.findByIdAndDelete(userId);
      return res.status(400).send({
        success: false,
        message:
          "A request with this student number already exists. You can only make a single request.",
      });
    }

    const existingRequest = await Request.findOne({ student: userId });

    if (existingRequest) {
      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            "studentDetails.lastName": data.lname,
            "studentDetails.firstName": data.fname,
            "studentDetails.middleName": data.mname,
            "studentDetails.studentNumber": data.studentno,
            "studentDetails.degreeProgram": data.degprog,
            "studentDetails.contact": data.mobileno,
            "studentDetails.address": data.address,
            "studentDetails.adviser": data.adviser,
          },
        },
        { new: true }
      );

      await Request.findByIdAndUpdate(
        existingRequest._id,
        {
          $set: {
            reason: data.reason,
            semester: data.gradsem,
            acadYear: data.gradyear,
            shiftTo: data.shiftto,
            isUPCampus: data.isUPCampus,
          },
        },
        { new: true }
      );

      const fileId = existingRequest.file;
      const authClient = await authorizeUpload();
      const drive = google.drive({ version: "v3", auth: authClient });

      const file = await drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        { responseType: "arraybuffer" }
      );

      const pdf = await createPDF(file.data, data);
      const pdfBuffer = Buffer.from(pdf);

      await drive.files.update({
        fileId: fileId,
        media: {
          mimeType: "application/pdf",
          body: Readable.from(pdfBuffer),
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${data.studentno} - CAS-OCS-Form-No-016-College-Clearance.pdf"`
      );
      res.send(pdfBuffer);
    } else {
      res.status(404).send({ success: false, message: "Request not found" });
    }
  } catch (error) {
    console.error("Error in form editing:", error);
    res.status(500).send({ success: false, message: "Error in form editing" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const request = await Request.findOne({ student: req.user._id })
      .populate("student")
      .populate("status")
      .lean();
    if (request) {
      res.send({ success: true, request: request });
    } else {
      res.send({ success: false, message: "Request not found" });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send({ success: false, message: "Unable to get request" });
  }
});

module.exports = router;
