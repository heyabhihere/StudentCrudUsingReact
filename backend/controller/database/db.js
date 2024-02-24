//db.js
const { default: mongoose } = require("mongoose")
const mongo = require("mongoose")


mongo.connect("mongodb://127.0.0.1:27017/DATABASE2")
const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, },
    email: { type: String, required: true },
    dialCode: { type: String },
    phoneNum: { type: String },
    pass: { type: String, required: true },
    jti: { type: String },
}, {
    timestamps: true 
});

const user = mongoose.model('user', userSchema)
module.exports = {
    user
}