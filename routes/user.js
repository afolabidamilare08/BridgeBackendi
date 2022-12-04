const router = require("express").Router();
const CryptoJS = require('crypto-js');
const { verifyTokenAndAdmin, verifyTokenAndAuthorization, FormidableVefification } = require("../auth/verifytoken");
const User = require('../models/user_model');
const multer = require("multer")
const fs = require('fs')
const path = require('path')
const cloudinary = require('cloudinary').v2




// get all user ( only admins can perform this operation )

router.get("/", verifyTokenAndAdmin, (req, res) => {

    User.find().sort({ _id: -1 })
        .then((users) => {

            var Allusers = []

            for (let i = 0; i < users.length; i++) {

                const { password, ...others } = users[i]._doc

                Allusers.push({ ...others })

            }

            res.status(200).json(Allusers)

        })
        .catch((err) => res.status(500).json(err))

})










// get specifit user ( only admin can do this request )

router.get("/:id", verifyTokenAndAuthorization, async (req, res) => {

    User.findOne({ _id: req.params.id })
        .then((user) => {

            const { password, ...others } = user._doc
            return res.status(200).json({ ...others })

        })
        .catch(err => res.status(200).json(err.message))

})





// edit profile ( only user and admin can do this request )

// upload.single('profile_picture')
router.put("/:id", verifyTokenAndAuthorization, FormidableVefification, async (req, res) => {

    var imagetoupload;

    if( !req.data.profile_picture ){
        imagetoupload = null
    }else{
        imagetoupload = req.data.profile_picture.filepath;
    }

    const uploadImage = async (imagetoupload) => {

        // Use the uploaded file's name as the asset's public ID and 
        // allow overwriting the asset with new versions
        const options = {
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        };
    
        try {
          // Upload the image
          const result = await cloudinary.uploader.upload(imagetoupload, options);
          console.log(result.url);
          return result;
        } catch (error) { 
          console.error(error);
          return error;
        }
    };

    const Theresult = await uploadImage(imagetoupload)



    User.findById(req.params.id)
        .then((user) => {

            const OldPicture = user.profile_image

            if (req.body.password) {
                req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
            }

            const { profile_picture, ...others } = req.data

            User.findByIdAndUpdate(
                req.params.id,
                { $set: {
                    ...req.data,
                    profile_image: imagetoupload ? Theresult : OldPicture
                }, },
                { new: true })
                .then((user) => {
                    const { password, ...others } = user._doc
                    cloudinary.uploader.destroy(OldPicture.public_id)
                    return res.status(200).json({ ...others })
                })
                .catch((err) => {
                    res.status(403).json(err.message)
                })


        })
        .catch((err) => {
            res.status(403).json(err.message)
        })

})





module.exports = router
