const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// UserSchema.method.generateToken = async function () {
//   try {
//     let token = jwt.sign(
//       {
//         userId: this._id.toString(),
//       },
//       process.env.JWT_SECRET_KEY,
//       {
//         expiresIn: "30d",
//       }
//     );
//     // this.tokens = this.tokens.concat({ token: token });
//     // await this.save();
//     return token;
//   } catch (err) {
//     console.log(err);
//   }
// };

module.exports = mongoose.model("User", UserSchema);
