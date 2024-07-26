const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const OtpCollection = require('../models/otpModel')

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: "saravanan@wearedev.team",
        pass: "NpBkV5jlr8-WeAlwin",
    },
});



router.post('/request', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions = {
        from: 'saravanan@wearedev.team',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}`
    };

    try {
        const checkUser = await User.findOne({ email });
        console.log(checkUser, "checkUser")

        if (checkUser !== null) {
            const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
            await OtpCollection.create({ email, otp, otpExpiration });

            const info = await transporter.sendMail(mailOptions);

            if (!info) {
                console.log('Error while sending email:', error);
                return res.status(500).json({status:false, error: 'Failed to send OTP email' });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({status:true, message: 'OTP sent successfully' });
            }
        } else {
            console.log("Email not found!");
            return res.status(404).json({status:false, message: "User email not found!" });
        }
    } catch (err) {
        console.log("Catch Error:", err);
        return res.status(500).json({status:false, error: 'Internal server error' });
    }
});

router.post('/verifyOtp', async (req, res) => {
    const { email, otp } = req.body;
    const checkUser = await OtpCollection.findOne({ email });
    console.log(checkUser,"Sarn",otp,checkUser.otp)
    try {
        if (checkUser) {
            console.log('verified email');
            if (otp === checkUser.otp) {
                console.log('verified');
                res.status(200).json({ status: true, message: "OTP successfully verified" });
            } else {
                console.log('Invalid OTp');
                res.status(200).json({ status: true, message: "OTP successfully verified" });
            }
        } else {
            console.log('Invalid OTp1');
            res.status(200).json({ status: true, message: "OTP successfully verified" });
        }
    } catch (err) {
        console.log(err,"errerrerr")
        res.status(200).json({ status: false, message: "OTP not verified" })
    }
});


router.post('/reset-pass', async (req, res) => {
    const { email, newPassword } = req.body;


    try {
        const checkUser = await OtpCollection.findOne({ email });

        if (!checkUser) {
            return res.status(200).json({ status: false, message: "User not found with this email" });
        }
        const otp = checkUser.otp;
        const otpExpiration = checkUser.otpExpiration;
        console.log(otp && otpExpiration > new Date())
        if (otp && otpExpiration > new Date()) {
            const updateUser = await User.updateOne(
                { email },
                { $set: { password: newPassword } }
            );
            console.log(updateUser)

            if (updateUser.modifiedCount === 1) {
                return res.status(200).json({ status: true, message: "Password updated successfully" });
            } else {
                return res.status(200).json({ status: false, message: "Failed to update password" });
            }
        } else {
            return res.status(200).json({ status: false, message: "Invalid or expired OTP" });
        }

    } catch (err) {
        console.log(err,"saran");
        return res.status(500).json({ status: false, message: `Error: ${err.message}` });
    }
});

module.exports = router;