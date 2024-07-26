const express = require("express");
const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);

const { setUpRoutes } = require("./routes.js");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const User = require("./models/user");
const connectToDB = require("./db.js");

async function main() {
  await connectToDB();

  const app = express();

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  var store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: "sessions",
    ttl: 2 * 60 * 60,
  });

  store.on("connected", () => {
    console.log("MongoStore connected to MongoDB");
  });

  store.on("error", function (error) {
    console.log(error);
  });

  app.use(
    session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET,
      store: store,
      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 2 * 60 * 60 * 1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(
    cors({
      origin: "https://cas-clearance.vercel.app",
      preflightContinue: true,
      credentials: true,
      methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"],
    })
  );

  app.set("trust proxy", 1);

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());

  setUpRoutes(app);

  app.listen(3001, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Server listening at port 3001");
    }
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
