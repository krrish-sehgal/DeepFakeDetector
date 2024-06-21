const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    extension: false,
    pageTitle: "Sign Up",
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password) //this is a method that decrypts the password that is stored in the database
        .then((doMatch) => {
          if (doMatch) {
            console.log("in doMatch");
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              if (err) {
                console.error(err);
              }
              return res.redirect("/");
            });
          } else {
            return res.redirect("/login");
          }
        })
        .catch((err) => {
          console.log(err);
          return res.redirect("/login");
        });
    })
    .catch((err) => {
      console.error(err);
      return res.redirect("/login");
    });
};

exports.postSignup = (req, res, next) => {
  let name = req.body.name;
  let userName = req.body.userName;
  let email = req.body.email;
  let password = req.body.password;
  let isExtension = req.body.isExtension;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/login");
      }
      return bcrypt
        .hash(password, 12)

        .then((hashedPass) => {
          const user = new User({
            name: name,
            userName: userName,
            email: email,
            password: hashedPass,
          });
          return user.save();
        })
        .then((result) => {
          if (isExtension) {
            return res.redirect("/extension");
          }
          res.redirect("/");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogOut = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
