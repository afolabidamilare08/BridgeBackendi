const router = require("express").Router();
const User = require("../models/user_model");
const Cart = require("../models/cart_model");
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const { validateSignup } = require("../validator/signupvalidator");
const { validateSignin } = require("../validator/signinvalidator");
const { Joierrorformat, MongoDBerrorformat } = require("../err/error_edit");


router.post('/signup', async (req, res) => {

    const { error, value } = validateSignup(req.body);

    if (error) {
        let error_message = Joierrorformat(error.details[0])

        return res.status(403).json(error_message)
    }

    const realusername = req.body.username.replace(' ','')

    const full_name = req.body.full_name
    const phone_number = req.body.phone_number
    const username = realusername
    const email = req.body.email
    const profile_image = {
        status: null
    }
    const password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
    const newUser = new User({
        full_name,
        phone_number,
        username,
        email,
        profile_image,
        password,
    })


    newUser.save()
        .then((user) => {

            const cart_owner = user.id
            const cart_products = []
            const cart_total = 0

            const newCart = new Cart({
                cart_owner,
                cart_products,
                cart_total
            })

            newCart.save()
                .then((cart) => {
                    const { password, ...others } = user._doc
                    res.status(200).json(others)
                })
                .catch(err => {
                    console.log(err)
                    res.status(403).json(err.message)
                })


        })
        .catch(err => {

            let error_message = MongoDBerrorformat(err)

            return res.status(403).json(error_message)

        })
})



router.post('/signin', async (req, res) => {

    const { error, value } = validateSignin(req.body)

    if (error) {

        let error_message = Joierrorformat(error.details[0])

        return res.status(400).json(error_message)
    }


    User.findOne({ username: req.body.username })
        .then(user => {

            if (!user) {

                return res.status(403).json("Incorrect Username");

            }


            const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC)
            const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8)


            if (Originalpassword !== req.body.password) {

                return res.status(403).json("Incorrect Password");
                
            }


            const accessToken = jwt.sign({
                id: user._id
            }, process.env.JWT_SEC)


            const { password, ...others } = user._doc


            Cart.findOne({ "cart_owner": user._id })
                .then((cart) => {

                    res.status(200).json({ ...others, cart, accessToken })

                })
                .catch(err => res.status(201).json(err)) 

        })
        .catch(err => res.status(403).json(err.message))

})


module.exports = router
