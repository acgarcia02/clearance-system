require("dotenv").config();
const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Request = require("../models/request");
const Status = require("../models/status");
const Notification = require("../models/notification");
const { transporter } = require("./mailer");

const createNotifs = async (title, content, recipients) => {
  const notifications = recipients.map((recipient) => ({
    title,
    content,
    recipient: recipient._id,
  }));
  const createdNotifs = await Notification.insertMany(notifications);
};

const sendEmailNotif = (recipient, subject, body) => {
  if (recipient.allowNotifs) {
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

router.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("student")
      .populate("status")
      .lean();

    const reviewed = requests.filter((request) => request.isReviewed == 1);
    const unreviewed = requests.filter(
      (request) => request.isReviewed === -1 && request.isSigned
    );

    res.send({ reviewed, unreviewed });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ success: false, message: "Unable to get requests" });
  }
});

router.patch("/approve", async (req, res) => {
  const { requestId, status } = req.body;
  try {
    const request = await Request.findByIdAndUpdate(
      requestId,
      { $set: { isReviewed: status } },
      { new: true }
    );
    if (request) {
      if (status === 1) {
        const recipients = await User.find({ role: "coordinator" }).lean();
        const updatedRequest = await Request.findById(requestId).populate(
          "student"
        );
        const title = "New application";
        const content = `${updatedRequest.student.studentDetails.lastName}, ${updatedRequest.student.studentDetails.firstName} ${updatedRequest.student.studentDetails.middleName} (${updatedRequest.student.studentDetails.studentNumber}) has applied for clearance.`;
        await createNotifs(title, content, recipients);
        recipients.forEach((recipient) => {
          sendEmailNotif(
            recipient,
            "[CAS Clearance] New Clearance Application Received",
            `Good day!\n\nA new clearance application has been submitted by ${updatedRequest.student.studentDetails.lastName}, ${updatedRequest.student.studentDetails.firstName} ${updatedRequest.student.studentDetails.middleName} (${updatedRequest.student.studentDetails.studentNumber}). Please review the application and take the necessary actions.\n\nBest regards,\nCAS College Clearance System`
          );
        });

        const recipient = updatedRequest.student._id;
        const notif = new Notification({
          title: "Approved clearance application",
          content: "Your clearance application has been approved.",
          recipient,
        });
        await notif.save();
        sendEmailNotif(
          updatedRequest.student,
          "[CAS CLEARANCE] Clearance Application Approved",
          `Dear ${updatedRequest.student.studentDetails.firstName},\n\nYour clearance application has been approved. You may now track your clearance status in your clearance portal.\n\nBest regards,\nCAS College Clearance System`
        );
      }
      res.send({ success: true });
    }
  } catch (error) {
    console.error("Error approving request:", error);
    res
      .status(500)
      .send({ success: false, message: "Unable to approve request" });
  }
});

router.get("/user", async (req, res) => {
  try {
    if (req.user.role === "student") {
      const request = await Request.findOne({ student: req.user.id })
        .select("file")
        .lean();
      return res.send({
        ...req.user.toObject(),
        file: request ? request.file : null,
      });
    }
    res.send(req.user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ success: false, message: "Unable to get user" });
  }
});

router.patch("/clear", async (req, res) => {
  const { request, newStatus, unit, remarks } = req.body;
  let title, content;
  try {
    const status = await Status.findByIdAndUpdate(
      request.status[unit]._id,
      { $set: { status: newStatus, remarks: remarks } },
      { new: true }
    );
    if (status) {
      request.status[unit] = status;
      if (
        request.status.filter((status) => status.status === "Cleared")
          .length === 8
      ) {
        const recipients = await User.find({ role: "admin" }).lean();
        title = "For CAS-OCS clearance";
        content = `${request.student.studentDetails.lastName}, ${request.student.studentDetails.firstName} ${request.student.studentDetails.middleName} (${request.student.studentDetails.studentNumber}) has been cleared for all units.`;
        await createNotifs(title, content, recipients);
        recipients.forEach((recipient) => {
          sendEmailNotif(
            recipient,
            "[CAS Clearance] New Clearance Application Received",
            `Good day!\n\nA new clearance application has been submitted by ${request.student.studentDetails.lastName}, ${request.student.studentDetails.firstName} ${request.student.studentDetails.middleName} (${request.student.studentDetails.studentNumber}). Please review the application and take the necessary actions.\n\nBest regards,\nCAS College Clearance System`
          );
        });
      }

      if (newStatus === "Cleared") {
        title = "Cleared for unit";
        content = `Your clearance has been approved by the ${request.status[unit].collegeUnit}.`;
        subject = `[CAS CLEARANCE] Cleared for ${request.status[unit].collegeUnit}`;
        body = `Dear ${request.student.studentDetails.firstName},\n\nYour clearance has been approved by the ${request.status[unit].collegeUnit}. You may keep track of your overall clearance status in your clearance portal.\n\nBest regards,\nCAS College Clearance System`;
      } else if (newStatus === "Withheld") {
        title = "Clearance withheld";
        content = `Your clearance has been disapproved by the ${request.status[unit].collegeUnit}.
                            Remarks: ${remarks}
                `;
        subject = "[CAS CLEARANCE] Clearance withheld";
        body = `Dear ${request.student.studentDetails.firstName},\n\nWe regret to inform you that your clearance has been disapproved by the ${request.status[unit].collegeUnit}. Please check your clearance portal for further details and steps to resolve this issue.\n\nBest regards,\nCAS College Clearance System`;
      } else {
        title = "Withheld clearance resolved";
        content = `Your withheld clearance has been resolved by the ${request.status[unit].collegeUnit}.
                  
                `;
        subject = "[CAS CLEARANCE] Withheld clearance resolved";
        body = `Dear ${request.student.studentDetails.firstName},\n\nYour previously withheld clearance request has been reviewed and resolved by the ${request.status[unit].collegeUnit}. The status of your request is now set to "Pending". You may keep track of your overall clearance status in your clearance portal.\n\nBest regards,\nCAS College Clearance System`;
      }
      const recipient = request.student._id;
      const notif = new Notification({ title, content, recipient });
      sendEmailNotif(request.student, subject, body);
      await notif.save();
      res.send({ success: true, request: request });
    }
  } catch (error) {
    console.error("Error clearing request:", error);
    res
      .status(500)
      .send({ success: false, message: "Unable to clear request" });
  }
});

router.delete("/delete-student", async (req, res) => {
  const { userId } = req.body;
  try {
    const student = await User.findById(userId).lean();
    if (!student) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const subject = "[CAS CLEARANCE] Ineligible for Clearance";
    const body = `Dear ${student.studentDetails.firstName},\n\nAfter careful review, you have been found ineligible for clearance. As a result, your request have been deleted from our system. If you believe this decision is incorrect or have any questions regarding this matter, please contact clearance.cas.ocs@gmail.com for further assistance.\n\nBest regards,\nCAS College Clearance System`;
    sendEmailNotif(student, subject, body);

    const request = await Request.findOne({ student: userId }).lean();
    await Status.deleteMany({ _id: { $in: request.status } });
    await Notification.deleteMany({ recipient: userId });
    await Request.deleteOne({ student: userId });
    await User.findByIdAndDelete(userId);

    res.send({ success: true });
  } catch (error) {
    console.error("Error deleting user and their requests:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting user and their requests",
    });
  }
});

router.post("/add", async (req, res) => {
  try {
    const data = req.body;
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res
        .status(400)
        .send({ success: false, message: "User already exists." });
    }

    const user = new User({
      email: data.email,
      displayName: data.name,
      role: data.role,
      unit: parseInt(data.unit),
    });
    await user.save();

    res.send(user);
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send({ success: false, message: "Error adding user" });
  }
});

router.get("/coordinators", async (req, res) => {
  try {
    const users = await User.find({ role: "coordinator" }).lean();
    res.send(users);
  } catch (error) {
    console.error("Error fetching coordinators:", error);
    res
      .status(500)
      .send({ success: false, message: "Unable to get coordinators" });
  }
});

router.patch("/coordinators", async (req, res) => {
  try {
    const data = req.body;

    const existingUser = await User.findOne({
      email: data.email,
      _id: { $ne: data.id },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use by another user",
      });
    }

    const user = await User.findByIdAndUpdate(
      data.id,
      {
        $set: {
          displayName: data.name,
          email: data.email,
          unit: parseInt(data.unit),
          role: data.role,
        },
      },
      { new: true }
    );

    if (user) {
      res.send(user);
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error editing user:", error);
    res.status(500).send({ success: false, message: "Error editing user" });
  }
});

router.delete("/coordinators", async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.body._id });
    const user = await User.findByIdAndDelete(req.body._id).lean();
    if (user) {
      res.send({ success: true });
    } else {
      res.status(404).send({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ success: false, message: "Error deleting user" });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user })
      .sort({ timestamp: -1 })
      .lean();

    res.send(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .send({ success: false, message: "Unable to get notifications" });
  }
});

router.delete("/delete-notification", async (req, res) => {
  const { notifId } = req.body;
  try {
    const notif = await Notification.findByIdAndDelete(notifId);
    if (notif) {
      res.send({ success: true });
    } else {
      res
        .status(404)
        .send({ success: false, message: "Notification not found" });
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    res
      .status(500)
      .send({ success: false, message: "Error deleting notification" });
  }
});

router.delete("/delete-all-notifs", async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.send({ success: true });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res
      .status(500)
      .send({ success: false, message: "Error deleting all notifications" });
  }
});

router.patch("/mark-read", async (req, res) => {
  const { notifId, read } = req.body;
  try {
    const notif = await Notification.findByIdAndUpdate(
      notifId,
      { $set: { read: read } },
      { new: true }
    );
    if (notif) {
      res.send({ success: true, notification: notif });
    } else {
      res.status(404).send({
        success: false,
        message: "Notification not found",
      });
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).send({
      success: false,
      message: "Error marking notification as read",
    });
  }
});

router.patch("/mark-all-read", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.send({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).send({
      success: false,
      message: "Error marking all notifications as read",
    });
  }
});

router.patch("/notif-preferences", async (req, res) => {
  try {
    const { allowNotifs } = req.body;
    await User.findByIdAndUpdate(req.user._id, { $set: { allowNotifs } });
    res.send({ success: true });
  } catch (error) {
    console.error("Error saving preferences:", error);
    res
      .status(500)
      .send({ success: false, message: "Error saving preferences" });
  }
});

router.get("/notif-preferences", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (user) {
      res.send({ success: true, allowNotifs: user.allowNotifs });
    } else {
      res.status(404).send({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res
      .status(500)
      .send({ success: false, message: "Error fetching preferences" });
  }
});

module.exports = router;
