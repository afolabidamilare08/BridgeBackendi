const router = require("express").Router();
const CryptoJS = require('crypto-js');
const { verifyTokenAndAdmin, verifyTokenAndAuthorization, verifyToken } = require("../auth/verifytoken");
const Otp = require('../models/otp_verification_model');
const User = require('../models/user_model');
const multer = require("multer")
const fs = require('fs')
const path = require('path')
const cloudinary = require('cloudinary').v2
const nodemailer = require('nodemailer')








const SendEmail = async (data) => {


    try{
        const UserDetails = await User.findById(data.user_id)

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'officialagriccong@gmail.com',
              pass: process.env.GMAIL_PASS
            }
          });
    
        var mailOptions = {
            from: 'officialagriccong@gmail.com',
            to: UserDetails.email,
            subject: `OTP Verification - Agrico Ng`,
            html: `
            
                    <body
                    style="
                    color: black;
                    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
                    "
                >
                    <img
                    src="https://res.cloudinary.com/drcn2xv3q/image/upload/v1667280524/css/agrico_rf8zve.png"
                    style="width: 150px; height: 150px; display: block; margin: 20px auto"
                    />
                    <div
                    style="
                        font-weight: bold;
                        text-align: center;
                
                        margin-top: 20px;
                    "
                    >
                    OTP Verification
                    </div>
                    <div style="text-align: center; margin-top: 40px">
                    Your OTP verification code is:
                    </div>
                    <div style="text-align: center; margin-top: 40px; font-weight: bold">
                    ${data.otp}
                    </div>
                </body>

            `
          };
    
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              return { status: "failed",info:error }
            } else {
              console.log('Email sent: ' + info.response);
              return { status: "successfull",info:info.response }
            }
          });

    }catch (err) {
        console.log ({ status: "failed",info:err })
    }

  }





// create a new otp

router.post( '/', async (req,res) => {

    Otp.findOne({ "user_id": req.body.user_id })
        .then( (theOtp) => {

            const randomOtp = Math.floor(Math.random() * 9000 + 1000);

            if ( theOtp ) {
                Otp.findOneAndUpdate({"user_id":req.body.user_id},{
                    $set:{
                        otp:randomOtp
                    }
                },{new:true})
                    .then( (otpDetails) => {
                        SendEmail(otpDetails)
                        res.status(200).json(otpDetails)
                        // return 
                    } )
                    .catch( err => res.status(403).json(err.message) )
            }

            if( !theOtp ){

                const user_id = req.body.user_id
                const otp = randomOtp
    
                const newOtp = new Otp({
                    user_id,
                    otp
                })
    
                newOtp.save()
                    .then( (otpDetails) => {
                        SendEmail(otpDetails)
                        res.status(200).json(otpDetails)
                        // return 
                    } )
                    .catch( err => res.status(403).json(err.message) )

            }


        } )
        .catch( err => res.status(403).json(err.message) )

} )





// verify otp code

router.put( '/verify_token', async (req,res) => {

    Otp.findOne({ "user_id": req.body.user_id })
    .then( (theOtp) => {

        const oldTimeupdatedate = new Date(theOtp.updatedAt)
        const nowTIme = new Date()

        const oldtimetime = oldTimeupdatedate.getTime()
        const nowtimetime = nowTIme.getTime()

        const calculate_difference = new Date( nowtimetime - oldtimetime )

        const minn = Math.floor(calculate_difference.getTime() / 60000) % 60;

        var thebodyOtp = parseInt(req.body.otp)

        if( minn < 10 || minn == 10 ){
            if( theOtp.otp === thebodyOtp ){

                User.findByIdAndUpdate(
                    req.body.user_id,
                    { $set: {
                        ...req.data,
                        isVerified: true
                    }, },
                    { new: true })
                    .then((user) => {
                        const { password, ...others } = user._doc
                        return res.status(200).json({ ...others })
                    })
                    .catch((err) => {
                        res.status(403).json(err.message)
                    })

            } else{
                return res.status(403).json("Invalid Otp")
            }
        }

        if( minn > 10 ){
            res.status(403).json("Otp Code has expired")    
        }

    } )
    .catch( err => res.status(403).json(err.message) )

} )



module.exports = router
