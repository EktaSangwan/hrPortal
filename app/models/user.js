var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    doj: {type: Date, required:true},
    endDate: {type: Date, required:true},
    profilePicture: { type: String },
    isUploaded: {type: Boolean, default: false },
    isApproved: {type: Boolean, default: false },
    isRejected: {type: Boolean, default: false },
    fileId: { type: String, default: "" },
    googleDataId: { type: String, default: "" },
    fileName: { type: String, default: "" },
});