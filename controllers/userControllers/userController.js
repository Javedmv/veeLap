const userSchema = require("../../models/userModel");
const nodemailer = require("nodemailer");
const { render } = require("../../routers/adminRouter");

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
let generatedOTP;

//get route for users login page
const loadLogin = async (req, res) => {
    try {
        res.render("user/login")
    } catch (error) {
        console.log(error.message)
    }
};
//get route for usersignup page
const loadSignup = async (req, res) => {
    try {
        res.render("user/signup", { error: null, message: null });

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

const sendOtp = async (req, res) => {
    try {

        const { email, phone } = req.query
        const ifExist = await userSchema.findOne({
            $or: [
                { email: email },
                { phoneNumber: phone }
            ]
        })
        if (ifExist) {
            res.status(200).json({ error: "User Already Exists" })
        } else {
            generatedOTP = otpGenerator.generate(6);
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
            await sendMails(transport, mailOption);
            res.status(200).json({ message: "OTP send to email successfully" })

        }
    } catch (error) {
        console.error(error)
    }
}

const verifyOtp = async (req, res) => {
    try {
        const userOtp = req.query.userOtp
        console.log(typeof userOtp)
        console.log(typeof generatedOTP)
        console.log("userOTP: " + userOtp)
        console.log("line 106 "+generatedOTP)
    if (userOtp && generatedOTP && userOtp === generatedOTP.toString()) {
        res.status(200).json({ message: "OTP Verification Successful" })
        
    } else {
        res.status(400).json({error:"OTP Verification Failed"})
    }
    } catch (error) {
        console.log(error)
        res.status(500).json({error:"Internal Server Error"})
    }
}


const submitSignup = async (req, res) => {
    try {
        const { username, email, phonenumber, password, } = req.body
        console.log("reached inside submit");
        console.log(username)
        console.log(email);
        console.log(phonenumber);
        console.log(password);
        res.render("user/login")
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    loadLogin,
    loadSignup,
    loadHome,
    sendOtp,
    verifyOtp,
    submitSignup
}
// onst resendOtp = async (req, res) => {
    //     try {
    
    //         const { email, phone } = req.query
    //         const ifExist = await userSchema.findOne({
    //             $or: [
    //                 { email: email },
    //                 { phoneNumber: phone }
    //             ]
    //         })
    //         if (ifExist) {
    //             res.status(200).json({ error: "User Already Exists" })
    //         } else {
    //             let generatedOTP = otpGenerator.generate(6);
    //             console.log("Generated reSend OTP:", generatedOTP);
    
    //             const transport = nodemailer.createTransport({
    //                 service: "gmail",
    //                 host: "smtp.gmail.com",
    //                 port: 587,
    //                 auth: {
    //                     user: process.env.MY_EMAIL_ID, //sender gmail
    //                     pass: process.env.APP_PASSWORD    //app password from gmail account
    //                 }
    //             });
    
    //             const mailOption = {
    //                 from: {
    //                     name: "veeLap",
    //                     address: process.env.MY_EMAIL_ID
    //                 },
    //                 to: email,
    //                 subject: "veeLap login",
    //                 text: "This is your one time OTP: " + generatedOTP + " don't share with anyone"
    //             }
    
    //             const sendMails = async (transport, mailOption) => {
    //                 try {
    //                     await transport.sendMail(mailOption)
    //                     console.log("email send successfully of reSend OTP")
    //                     // console.log('Server response:', info.response); error says info is not defined
    //                 } catch (error) {
    //                     console.log(error)
    //                 }
    //             }
    //             sendMails(transport, mailOption);
    //             res.status(200).json({ message: "OTP send to email successfully" })
    
    //         }
    //     } catch (error) {
    //         console.error(error)
    //     }
    // }
    