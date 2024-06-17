const express = require("express");
const mongoose = require("mongoose");

const multer = require("multer");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// multer is a middleware which is used to store files in the server
const fileStorge = multer.diskStorage({
  // the cb is a callback function, which will be called by multer when the file is done storing
  destination: (req, file, cb) => {
    cb(null, "images");
    // cb(errorMssg,name of the directory where the file will be stored));
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
    // cb(errorMssg, name of the file);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
    // cb(errorMssg, store it );
  } else {
    cb(null, false);
    // cb(errorMssg, dont store it);
  }
};

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(
  multer({ storage: fileStorge, fileFilter: fileFilter }).single("image")
);

app.set("view engine", "ejs");
app.set("views", "views");

const User = require("./models/user");

app.use(
  session({
    secret: "My secret",
    resave: false,
    saveUninitialized: false,
    store: store, //setting to store in a db store
  })
);
app.use((req, res, next) => {
  if (!req.session.user) {
    console.log("here in session");
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        console.log("not exsists");
      }
      console.log("this is user after sessino = " + user);
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

const errorController = require("./controllers/error");

const websiteRoutes = require("./routes/websiteRoutes");
const extensionRoutes = require("./routes/extensionRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(authRoutes);
app.use(websiteRoutes);
app.use("/extension", extensionRoutes);
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(port, () => {
      console.log(`Running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
