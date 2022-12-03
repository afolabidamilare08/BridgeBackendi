const router = require("express").Router();
const Address = require('../models/address_model');
const { verifyTokenAndAdmin, verifyToken, verifyTokenAndAdminAndCartOwner } = require("../auth/verifytoken");
const { validateaddtocart } = require("../validator/add_to_cart_validator");
const { Joierrorformat } = require("../err/error_edit");




router.get('/get_address/', verifyToken, async (req,res) => {

    Address.findOne({"user":req.user.id})
        .then( (Theaddress) => {
            
            if( Theaddress ){
                res.status(200).json(Theaddress)
                return
            }

            const address = ''
            const city = ''
            const country = ''
            const lga = ''
            const state = ''
            const user = req.user.id

            const newAddress = new Address({
                address,
                city,
                country,
                lga,
                state,
                user
            })

            newAddress.save()
                .then( (Daddress) => res.status(200).json(Daddress) )
                .catch( err => res.status(403).json(err.message) )

        } )
        .catch( err => res.status(403).json(err.message) )

} )


router.put('/edit_address', verifyToken, async ( req, res ) => {

    const NewAddress = {
        address: req.body.address,
        city: req.body.city,
        country: "Nigeria",
        lga: req.body.lga,
        state: req.body.state,
    }

    Address.findOneAndUpdate({
        user:req.user.id
    },{
        $set:{
            ...NewAddress
        }
    },{ new: true })
    .then( (theAddress) => {
        res.status(200).json(theAddress)
    } )
    .catch( err => res.status(403).json(err.message) )

} )


module.exports = router
