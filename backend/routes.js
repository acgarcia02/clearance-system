const authentication = require("./controllers/auth-controller");
const studentController = require("./controllers/student");
const staffController = require("./controllers/staff");
const pdfUploadController = require("./controllers/pdf-upload");
const imageUploadController = require("./controllers/image-upload");

const setUpRoutes = (app) => {
  app.use("/auth/google", authentication);
  app.use("/student", studentController);
  app.use("/staff", staffController);
  app.use("/pdf", pdfUploadController);
  app.use("/image", imageUploadController);
};

module.exports = { setUpRoutes };
