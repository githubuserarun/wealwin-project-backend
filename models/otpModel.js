const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const otpSchema= new Schema({
    email: String,
    otp: String,
    otpExpiration: Date
  });
  
  otpSchema.index({ otpExpiration: 1 }, { expireAfterSeconds: 0 });

  module.exports = mongoose.model('OtpCollection', otpSchema);