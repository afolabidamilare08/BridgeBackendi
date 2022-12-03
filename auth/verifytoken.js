const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const Product = require('../models/product_model');
const Cart = require('../models/cart_model');
const Shop = require('../models/shop_model');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const { Joierrorformat, MongoDBerrorformat } = require("../err/error_edit");




const verifyToken = (req, res, next) => {

    const authHeader = req.headers.token

    if (authHeader) {

        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SEC, (err, user) => {

            if (err) {
                res.status(403).json("Token is not valid!")
            } else {

                User.findOne({ _id: user.id })
                    .then((user) => {

                        req.user = user
                        next()

                    })
                    .catch(err => res.status(403).json(err))

            }

        })

    } else {
        // console.log(req)
        return res.status(401).json('you are not authenticated')
    }

}


const verifyTokenAndAuthorization = (req, res, next) => {

    verifyToken(req, res, () => {

        if (req.user.id === req.params.id || req.user.isAdmin) {
            next()
        } else {
            res.status(403).json("You are not allowed to do that")
        }

    })

}


const verifyTokenAndAdmin = (req, res, next) => {

    verifyToken(req, res, () => {

        if (req.user.isAdmin === true) {
            next()
        } else {
            res.status(403).json("You are not allowed to do that because you are not an admin")
        }

    })

}


const verifyTokenAndAdminAndShopOwner = (req, res, next) => {

    verifyToken(req, res, () => {

        if (req.user.isAdmin || req.user.isShopOwner) {
            next()
        } else {
            res.status(403).json("You are not allowed to do that because you are not an admin or a shop owner")
        }

    })

}

const verifyisAdminOrIsProductOwner = (req, res, next) => {

    verifyTokenAndAdminAndShopOwner(req, res, () => {

        Product.findOne({ "_id": req.params.id })
            .then((product) => {

                if (product.shop_owner === req.user.id || req.user.isAdmin) {
                    req.product = product
                    next()
                } else {
                    res.status(403).json("You are not allowed to do that because this product dosen't belong to this user")
                }

            })
            .catch(err => res.status(400).json(err))

    })

}


const verifyTokenAndAdminAndCartOwner = (req, res, next) => {

    verifyToken(req, res, () => {

        if (req.user.id || req.user.isAdmin) {

            Cart.findOne({ "cart_owner": req.user.id })
                .then((cart) => {

                    req.cart = cart

                    next()

                })
                .catch(err => res.status(400).json(err))

        } else {
            res.status(403).json("You are not allowed to do that because this cart dosen't belong to this user")
        }

    })

}

const FormidableVefification = (req, res, next) => {
    const form = formidable({ multiples: true })
    form.parse(req,(err,fields,files) => {
        if (err) {
            next();
            // return;
          }
         req.data = ({ ...fields, ...files })
         next()
    } )

} 

const ShopOwnerVerification = (req,res,next) => {

    if(!req.user.isShopOwner){
        res.status(404).json("you currently don't own a shop")
    }

    Shop.findOne({ "shop_owner": req.user.id })
    .then((shop) => {
        next()
    })
    .catch(err => {
        let messageError = MongoDBerrorformat(err,"Shop")
        console.log(err)
        return res.status(403).json(messageError)
    })

}


module.exports = { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenAndAdminAndShopOwner, ShopOwnerVerification , verifyisAdminOrIsProductOwner, verifyTokenAndAdminAndCartOwner,FormidableVefification }