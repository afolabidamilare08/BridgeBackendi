const router = require("express").Router();
const Cart = require("../models/cart_model");
const { verifyToken } = require("../auth/verifytoken");




    router.get( '/get_user', verifyToken, async ( req, res ) => {

        const user = req.user

        Cart.findOne({"cart_owner":user._id})
        .then( (cart) => {

            const { password, ...others } = user._doc

            res.status(200).json({...others,cart})

        } )
        .catch( err => res.status(403).json(err) )

    }  )



module.exports = router
