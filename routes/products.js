const router = require("express").Router();
const Product = require('../models/product_model');
const Category = require('../models/category_model');
const { verifyisAdminOrIsProductOwner, FormidableVefification } = require("../auth/verifytoken");
const { validateProduct } = require("../validator/productvalidator");
const multer = require("multer")
const fs = require('fs')
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Axios = require('axios');
const { Expo } = require('expo-server-sdk')



let expo = new Expo();


// Create the messages that you want to send to clients

let somePushTokens = ["ExponentPushToken[MycuhLBJD9yfgjvsSByonR]"]

let messages = [];
for (let pushToken of somePushTokens) {
  // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    continue;
  }

  // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
  messages.push({
    to: pushToken,
    sound: 'default',
    body: 'This is a test notification',
    data: { withSome: 'data' },
  })
}



// The Expo push notification service accepts batches of notifications so
// that you don't need to send 1000 requests to send 1000 notifications. We
// recommend you batch your notifications to reduce the number of requests
// and to compress them (notifications with similar content will get
// compressed).
let chunks = expo.chunkPushNotifications(messages);
let tickets = [];

const sendOutnotification = async () => {

    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }

}

// Later, after the Expo push notification service has delivered the
// notifications to Apple or Google (usually quickly, but allow the the service
// up to 30 minutes when under load), a "receipt" for each notification is
// created. The receipts will be available for at least a day; stale receipts
// are deleted.
//
// The ID of each receipt is sent back in the response "ticket" for each
// notification. In summary, sending a notification produces a ticket, which
// contains a receipt ID you later use to get the receipt.
//
// The receipts may contain error codes to which you must respond. In
// particular, Apple or Google may block apps that continue to send
// notifications to devices that have blocked notifications or have uninstalled
// your app. Expo does not control this policy and sends back the feedback from
// Apple and Google so you can handle it appropriately.


let receiptIds = [];
for (let ticket of tickets) {
  // NOTE: Not all tickets have IDs; for example, tickets for notifications
  // that could not be enqueued will have error information and no receipt ID.
  if (ticket.id) {
    receiptIds.push(ticket.id);
  }
}

let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

const dealwithpushNotificationResults = async () => {

    // Like sending notifications, there are different strategies you could use
  // to retrieve batches of receipts from the Expo service.
  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log(receipts);

      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.
      for (let receiptId in receipts) {
        let { status, message, details } = receipts[receiptId];
        if (status === 'ok') {
          continue;
        } else if (status === 'error') {
          console.error(
            `There was an error sending a notification: ${message}`
          );
          if (details && details.error) {
            // The error codes are listed in the Expo documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            // You must handle the errors appropriately.
            console.error(`The error code is ${details.error}`);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

}






const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'products_images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }

})

const upload = multer({ storage: storage })



const deleteallpostedfiles = (files) => {

    if (files) {

        for (let file = 0; file < files.length; file++) {

            const currentfile = files[file]

            try {
                fs.unlinkSync(currentfile.path);
                console.log("file removed")

            } catch (err) {
                console.error(err)
            }

        }

    }

}

// geting all products ( anybody can do this request )

router.get('/', async (req, res) => {

    const qCategory = req.query.category;
    const qSearch = req.query.search;


    if ( qCategory && !qSearch ) {
        Product.find({
            "product_category": qCategory
        }).sort({ _id: -1 })
            .then((products) => {
                return res.status(200).json(products)
            })
            .catch(err => { return err })
    }

    if ( qSearch && !qCategory ) {
        Product.find({
            "product_name": { $regex: qSearch, $options: "i" },
        }).sort({ _id: -1 })
            .then((products) => {
                // sendOutnotification()
                // dealwithpushNotificationResults()
                return res.status(200).json(products)
            })
            .catch(err => { return err })
    }

    if(!qCategory && !qSearch ){

        Product.find().sort({ _id: -1 })
        .then((products) => {
            res.status(200).json(products)
        })
        .catch(err => { return err })

    }


})







// get a specific product ( anybody can do this request )

router.get('/product/:id', async (req, res) => {

    Product.findOne({ "_id": req.params.id })
        .then((product) => res.status(200).json(product))
        .catch(err => res.status(400).json(err))

})



const savePictures = async ( req,res,next ) => {

    var IncomingImages;

    if( !req.data.product_images ){
       next()
       console.log("exist not")
       return
    }

    if( req.data.product_images.length > 1 ){
        IncomingImages = [...req.data.product_images]
    }else{ IncomingImages = [req.data.product_images] }

    const Images = []

    // if( req.data.product_images.length < 3 || req.data.product_images.length > 3 ){
    //     return res.status(400).json("Only 3 images are allowed")
    // }

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

    const Forloop = async () => {
        
        for (let i = 0; i < IncomingImages.length; i++) {

            var image = IncomingImages[i]
            
            const result = await uploadImage(image.filepath)
            Images.push(result)
        
        }

        return Images
    }

    const NewIMages = await Forloop()

    req.Images = [...NewIMages]
    next()

} 

const DeleteUploadedImage = (data) => {

    for (let k = 0; k < data.length; k++) {
        cloudinary.uploader.destroy(data[k].public_id)
    }
}


// edit product ( only product owner and admin can do this request )

router.put('/product/:id',verifyisAdminOrIsProductOwner, FormidableVefification, savePictures , async (req, res) => {

    Product.findOne({ "_id": req.params.id })
        .then((product) => {

            const Images = [...product.product_images]

            const ImagesToAdd = req.Images ? req.Images : []

            const removePattern = req.data.removearray

            var ImagesToDelete = []

            for (let k = 0; k < ImagesToAdd.length; k++) {
                const ImageSha = ImagesToAdd[k]
                    const wheretoreplace = parseInt(removePattern[k])
                    ImagesToDelete.push(Images[wheretoreplace])
                    Images.splice(wheretoreplace,1,ImageSha)
            }

            var theUpdatedBody = {
                ...req.body,
                product_images:Images
            }

            Product.findByIdAndUpdate(
                req.product.id,
                { $set: theUpdatedBody, },
                { new: true })
                .then((product) => {
                    DeleteUploadedImage(ImagesToDelete)
                    return res.status(200).json(product)
                })
                .catch(err => {
                    DeleteUploadedImage(req.Images)
                    return res.status(400).json(err.message)
                })
 
        }).catch(err => {
            DeleteUploadedImage(req.Images)
            return res.status(403).json(err.message)
    })
})


module.exports = router
