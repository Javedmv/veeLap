const userSchema = require("../../models/userModel");
const nodemailer = require("nodemailer");
const { render } = require("../../routers/adminRouter");
const { json } = require("express");

const otpGenerator = {
    generate: function (length) {
        const numberChars = '0123456789';

        let otp = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * numberChars.length);
            otp += numberChars.charAt(randomIndex);
        }

        return otp;
    }
};


//get route for users login page
const loadUserLogin = async (req, res) => {
    try {
        res.render("user/Login")
    } catch (error) {
        console.log(error.message)
    }
};
//get route for usersignup page
const loadUserSignup = async (req, res) => {
    try {
        res.render("user/Signup");
    } catch (error) {
        console.log(error.message);
    }
}
//get route of dashboard
const loadHome = async (req, res) => {
    try {
        res.render("user/home")
    } catch (error) {
        console.log(error.message)
    }
}
// get route for email authenthecation page
const loadEmailAuth = async (req, res) => {
    try {
        res.render("user/emailAuth")
    } catch (error) {
        console.log(error.message)
    }
}

//get route for otp page
const loadOtp = async (req, res) => {
    try {
        res.render("user/otp")
    } catch (error) {
        console.log(error.message)
    }
}

// post route of otp page
const sendOtp = async (req, res) => {
    try {
        const { email, phone } = req.body

        const userE = await userSchema.findOne({ email: email })
        const userM = await userSchema.findOne({ phone: phone })
        if (userE) {
            res.render("user/emailAuth", { emailAlreadyExist: true })
        } else if (userM) {
            res.render("user/emailAuth", { phoneAlreadyExist: true })
        } else {
            // Generate OTP
            let generatedOTP = otpGenerator.generate(6);
            console.log("Generated OTP:", generatedOTP);

            const transport = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 587,
                auth: {
                    user: process.env.MY_EMAIL_ID, //sender gmail
                    pass: process.env.APP_PASSWORD    //app password from gmail account
                }
            });

            const mailOption = {
                from: {
                    name: "veeLap",
                    address: process.env.MY_EMAIL_ID
                },
                to: email,
                subject: "veeLap login",
                text: "This is your one time OTP: " + generatedOTP + " don't share with anyone"
            }

            const sendMails = async (transport, mailOption) => {
                try {
                    await transport.sendMail(mailOption)
                    console.log("email send successfully")
                    // console.log('Server response:', info.response); error says info is not defined
                } catch (error) {
                    console.log(error)
                }
            }
            // sendMails(transport, mailOption);

            res.render("user/otp", { generatedOTP, email, phone, mess: null })
        }
    }
    catch (error) {
        console.log(error)
    }
}


const verifyOtp = async (req, res) => {
    try {
        console.log("inside verify");
        // const data = JSON.parse(req.body)
        // console.log(data, "jjjjj")
        const { email, phone, enteredOtp, genOTP } = req.body;
        console.log("type of genotp===" + typeof (req.body.newOtp));
        const generatedOTP = parseInt(req.body.newOtp);

        console.log("gen otp  = " + generatedOTP)
        console.log("entered one  = " + enteredOtp)
        if (enteredOtp === genOTP) {
            console.log("reached here");
            res.redirect("/user/signup");
        } else {
            // If OTPs do not match, render the "user/otp" page with an error message
            console.log("hope here");
            console.log(email, "email");
            console.log(phone, " here");
            console.log("hope here");

            res.status(200).render("user/otp", { mess: "invalid otp", email, phone, generatedOTP: genOTP })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


module.exports = {
    loadUserLogin,
    loadUserSignup,
    loadHome,
    loadEmailAuth,
    sendOtp,
    loadOtp,
    verifyOtp,


}