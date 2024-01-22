const userModel = require("../../models/userModel");
const nodemailer = require("nodemailer");
const { render } = require("../../routers/adminRouter");
const jwt = require("jsonwebtoken")
const jwtKey = require("../../config/jwt");
const productModel = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel");
const Swal = require('sweetalert2');
const walletModel = require("../../models/walletModel");
const Randomstring = require("randomstring")

const otpGenerator = {
    generate: function (length) {
        const numberChars = "0123456789";

        let otp = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * numberChars.length);
            otp += numberChars.charAt(randomIndex);
        }

        return otp;
    },
};
let generatedOTP;


//get route for users login page
const loadLogin = async (req, res) => {
    try {
        res.render("user/login", { error: null });
    } catch (error) {
        console.log(error.message);
    }
};
//get route for usersignup page
const loadSignup = async (req, res) => {
    try {
        res.render("user/signup", { error: null });
    } catch (error) {
        console.log(error.message);
    }
};
//get route of dashboard
const loadHome = async (req, res) => {
    try {
        const loggedIn = req.cookies.loggedIn
        const userEmail = req.cookies.userEmail
        const page = req.query.page || 1;
        const no_doc_on_each_pages = 9;
        const totalProducts = await productModel.countDocuments({
            status: "Active",
        });
        const totalPages = Math.ceil(totalProducts / no_doc_on_each_pages)
        const skip = (page - 1) * no_doc_on_each_pages
        const products = await productModel.find({ status: "Active" }).skip(skip).limit(no_doc_on_each_pages)
        const category = await categoryModel.find({})
        res.render("user/home", { userEmail, loggedIn, products, category, page, totalPages });
    } catch (error) {
        console.log(error.message);
    }
};


// load forgot password

const loadForgotPassword = async (req, res) => {
    try {
        res.render("user/forgotPassword");
    } catch (error) {
        console.log(error);
    }
};

const sendOtp = async (req, res) => {
    try {
        const { email, phone } = req.query;
        const ifExist = await userModel.findOne({
            $or: [{ email: email }, { phoneNumber: phone }],
        });
        if (ifExist) {
            res.status(401).json({ error: "User Already Exists" });
        } else {
            generatedOTP = otpGenerator.generate(6);
            console.log("Generated OTP:", generatedOTP);

            const transport = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 587,
                auth: {
                    user: process.env.MY_EMAIL_ID, //sender gmail
                    pass: process.env.APP_PASSWORD, //app password from gmail account
                },
            });

            const mailOption = {
                from: {
                    name: "veeLap",
                    address: process.env.MY_EMAIL_ID,
                },
                to: email,
                subject: "veeLap login",
                text:
                    "This is your one time OTP: " +
                    generatedOTP +
                    " don't share with anyone",
            };

            const sendMails = async (transport, mailOption) => {
                try {
                    await transport.sendMail(mailOption);
                    console.log("email send successfully");
                    // console.log('Server response:', info.response); error says info is not defined
                } catch (error) {
                    console.log(error);
                }
            };
            await sendMails(transport, mailOption);
            res.status(200).json({ message: "OTP send to email successfully" });
        }
    } catch (error) {
        console.error(error);
    }
};

const verifyOtp = async (req, res) => {
    try {
        const userOtp = req.query.userOtp;
        console.log(typeof userOtp);
        console.log(typeof generatedOTP);
        console.log("userOTP: " + userOtp);
        console.log("line 106 " + generatedOTP);
        if (userOtp && generatedOTP && userOtp === generatedOTP.toString()) {
            res.status(200).json({ message: "OTP Verification Successful" });
        } else {
            res.status(400).json({ error: "OTP Verification Failed" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// adding user to data base in signup
const submitSignup = async (req, res) => {
    try {
        const { userName, email, phoneNumber, password } = req.body;
        const userData = await userModel.findOne({ email });
        if (userData) {
            res.render("user/signup", { error: "Email already exists" });
        } else {
            let code = Randomstring.generate(8)
            console.log(code);
            await userModel.create({
                userName: userName,
                email: email,
                phoneNumber: phoneNumber,
                password: password,
                ReferralCode: code,
            });
            const newUser = await userModel.findOne({ email: email })
            await walletModel.create({
                userId: newUser._id
            })
            res.render("user/referalCode",{email:email})
            // res.render("user/login", {
            //     message: "User sign up successfully",
            //     error: null,
            // });
        }
    } catch (error) {
        console.error(error);
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const userData = await userModel.findOne({ email })
        // console.log("userData ------ password" + userData.password)
        if (!userData) {
            res.status(401).render("user/login", { error: "user not found" })

        } else if (userData.status == "Inactive") {
            res.status(404).render("user/login", { error: "user is blocked" })
        } else {
            if (userData.password == password) {
                try {
                    const token = jwt.sign(email, jwtKey.secretKey)
                    res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000 });
                    res.cookie("loggedIn", true, { maxAge: 24 * 60 * 60 * 1000 });
                    res.cookie("userEmail", userData.email);
                    // res.status(200).json({ success: true });
                    res.redirect("/user/")
                } catch (error) {
                    console.error(error)
                    res.status(500).render("user/login", { error: "Internal Server Error" });

                }
            } else {
                res.status(400).render("user/login", { error: "incorrect password" })
            }
        }
    } catch (error) {
        console.log(error)
    }
}

const userLogout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.clearCookie("loggedIn");
        res.clearCookie("userEmail");
        // res.clearCookie("userName");
        res.redirect("/user/")
    } catch (error) {
        console.log(error)
    }
}

const sendOtpForgot = async (req, res) => {
    try {
        const userEmail = req.body.email;
        const ifExist = await userModel.findOne({ email: userEmail })
        if (ifExist) {
            generatedOTP = otpGenerator.generate(6);
            console.log("Generated OTP OF FORGOT:", generatedOTP);
            const transport = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 587,
                auth: {
                    user: process.env.MY_EMAIL_ID, //sender gmail
                    pass: process.env.APP_PASSWORD, //app password from gmail account
                },
            });

            const mailOption = {
                from: {
                    name: "veeLap",
                    address: process.env.MY_EMAIL_ID,
                },
                to: userEmail,
                subject: "veeLap login",
                text:
                    "This is your one time OTP: " +
                    generatedOTP +
                    " don't share with anyone",
            };
            const sendMails = async (transport, mailOption) => {
                try {
                    await transport.sendMail(mailOption);
                    // console.log("email send successfully");
                    // console.log('Server response:', info.response); error says info is not defined
                } catch (error) {
                    console.log(error);
                }
            };
            // await sendMails(transport, mailOption);
            res.status(200).json({ message: "OTP send to email successfully" });
        } else {
            res.json({ error: "User not found" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const verifyForgotOtp = async (req, res) => {
    try {
        const enteredOtp = req.body.OTP

        if (enteredOtp === generatedOTP) {
            res.status(200).json({ message: "OTP Verification Successful" });
        } else {
            res.status(401).json({ error: "Incorrect OTP" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, email } = req.body
        if (password === confirmPassword) {
            await userModel.updateOne({ email }, {
                $set: {
                    password: password
                }
            })
            res.status(200).json({ message: "Password Reset Successfull" })
        } else {
            res.status(401).json({ error: "password and confirm password dosent match" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" })
    }
};

const editUserDetails = async (req, res) => {
    try {
        const { newPhoneNumber, newEmail, newUserName } = req.body
        const userData = await userModel.findOne({ email: req.user });
        if (newEmail != userData.email) {

        } else {
            await userModel.updateOne({ email: req.user }, { $set: { phoneNumber: newPhoneNumber, userName: newUserName } })
            return res.redirect("/user/profile")
        }
        res.redirect("/user/logout")

    } catch (error) {
        console.log(error);
    }
};

const submitReferal = async (req,res) => {
    try {
        res.render("user/login",{message: "User sign up successfully", error: null})
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadLogin,
    loadSignup,
    loadHome,
    sendOtp,
    verifyOtp,
    submitSignup,
    userLogin,
    userLogout,
    loadForgotPassword,
    sendOtpForgot,
    verifyForgotOtp,
    resetPassword,
    editUserDetails,
    submitReferal
};



