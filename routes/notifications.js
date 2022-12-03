const router = require("express").Router();
const { verifyTokenAndAdmin, verifyTokenAndAuthorization, verifyToken } = require("../auth/verifytoken");
const Notification = require('../models/notifications_model');
const User = require('../models/user_model');





router.get( '/', verifyToken ,async (req,res) => {

    Notification.findOne({"user_id":req.user.id})
        .then( (notification) => {

            if( notification ){
                res.status(200).json(notification)
                return
            }

            if( !notification ){
                const user_id = req.user.id
                const status = false
                const user_notifications = []

                const newNotification = new Notification({
                    user_id,
                    status,
                    user_notifications
                })

                newNotification.save()
                    .then( (user_notification) => {

                        res.status(200).json(user_notification)


                    } )
                    .catch( err => res.status(403).json(err.message) )

            }

        } )
        .catch( err => res.status(403).json(err.message) )

} )



router.put( '/update_notifications', verifyToken ,async (req,res) => {

    Notification.findOneAndUpdate({"user_id":req.user.id},{
        $set:{
            status:false
        }
    },{new:true})
        .then( (notification) => {
                res.status(200).json(notification)
                
        } )
        .catch( err => res.status(403).json(err.message) )

} )





module.exports = router
