//marks.js
const { default: mongoose } = require('mongoose')
const user = require('./db')

const MarksSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    subject: { type: String, required: true },
    marks: { type: String, required: true }
}, {
    timestamps: true
})
const marks = mongoose.model('marks', MarksSchema)

module.exports = {
    marks
}