const router = require("express").Router();
const Shop = require('../models/shop_model');
const Product = require('../models/product_model');
const Category = require('../models/category_model');
const { verifyTokenAndAdminAndShopOwner, verifyTokenAndAdmin, verifyToken, FormidableVefification,ShopOwnerVerification } = require("../auth/verifytoken");
const { validateShop } = require("../validator/shopvalidator");
const { validateProduct } = require("../validator/productvalidator");
const multer = require("multer")
const fs = require('fs')
const path = require('path');
const { Joierrorformat, MongoDBerrorformat } = require("../err/error_edit");
const cloudinary = require('cloudinary').v2





const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'products_images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }

})

const upload = multer({ storage: storage })



const storageToShopImages = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'shops_images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }

})

const uploadToShopImages = multer({ storage: storageToShopImages })



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


// geting all shops ( only admin can do this request )

router.get('/', verifyTokenAndAdmin, async (req, res) => {

    Shop.find().sort({ _id: -1 })
        .then(shops => res.status(200).json(shops))
        .catch(err => res.status(400).json(err.message))

})







// create your own shop ( only shop owner can do this request )

router.post('/add_shop', verifyToken, uploadToShopImages.single('shop_image'), async (req, res) => {

    Shop.findOne({ "shop_owner": req.user.id })
    .then((shop) => {

        if ( shop ) {
            return res.status(403).json("You alerady have a shop")
        }else{

            if (req.user.isShopOwner) {

                const { error, value } = validateShop({ ...req.body });

                if (error) {
                    deleteallpostedfiles([req.file])
                    let error_message = Joierrorformat(error.details[0])
                    return res.status(403).json(error_message)
                }
        
                const shop_owner = req.user.id
                const shop_name = req.body.shop_name
                const shop_description = req.body.shop_description
                const shop_country = req.body.shop_country
                const shop_state = req.body.shop_state
                const shop_lga = req.body.shop_lga
                const shop_address = req.body.shop_address
                const shop_email = req.body.shop_email
                const shop_phoneNumber = req.body.shop_phoneNumber
                const shop_products = []
                const shop_image = req.file ? req.file : null

                const newShop = new Shop({
                    shop_owner,
                    shop_name,
                    shop_description,
                    shop_country,
                    shop_state,
                    shop_lga,
                    shop_address,
                    shop_email,
                    shop_phoneNumber,
                    shop_products,
                    shop_image
                })

                newShop.save()
                    .then((shop) => res.status(200).json(shop))
                    .catch(err => {
                        deleteallpostedfiles([req.file])
                        return res.status(403).json(err.message)
                    })

            } else {
                deleteallpostedfiles([req.file])
                return res.status(403).json("you are not yet eligible to own a shop")
            }

        }

    })
    .catch(err => res.status(400).json(err.message))


})







// Get details about any shop ( anybody can do this request )

router.get('/shop/:id', async (req, res) => {

    Shop.findById(req.params.id)
        .then(shop => {

            const TheShop = shop

            Product.find({
                "shop": req.params.id
            }).sort({ _id: -1 })
                .then((products) => {

                    TheShop.shop_products = products
                    res.status(200).json(TheShop)

                })
                .catch(err => res.status(400).json(err.message))

        })
        .catch(err => res.status(400).json(err.message))

})







// edit your own shop ( only shop owners and admin can do that ).

router.put('/shop/:id', verifyToken, uploadToShopImages.array('shop_image', 1), async (req, res) => {

    Shop.findById(req.params.id)
        .then((shop) => {

            if( shop.shop_image !== null ){
                var oldPictures = [...shop.shop_image]
            }else{
                oldPictures = shop.shop_image
            }

            if (req.user.id !== shop.shop_owner && !req.user.isAdmin) {
                deleteallpostedfiles(req.files)
                return res.status(403).json({
                    user: req.user.id,
                    shop: shop.shop_owner,
                    message: "You are not allowed to do that because this is not your shop"
                })
            }

            Shop.findByIdAndUpdate(
                req.params.id,
                {
                    $set: {
                        ...req.body,
                        shop_image: null
                    },
                },
                { new: true })
                .then((shop) => {
                    res.status(200).json(shop)
                    // if (req.files.length > 0) {
                    //     deleteallpostedfiles(oldPictures)
                    // }
                })
                .catch(err => {
                    deleteallpostedfiles(req.files)
                    res.status(400).json(err.message)
                })

        })
        .catch(err => {
            deleteallpostedfiles(req.files)
            res.status(400).json(err.message)
        })

})







// get all your own shop, ( only shop owners can do that )

router.get('/my_shop', verifyToken, async (req, res) => {


    if (req.user.isShopOwner) {

        Shop.findOne({ "shop_owner": req.user.id })
            .then((shop) => {

                const TheShop = shop

                Product.find({
                    "shop": TheShop.id
                }).sort({ _id: -1 })
                    .then((products) => {

                        TheShop.shop_products = products
                        res.status(200).json(TheShop)

                    })
                    .catch(err => res.status(400).json(err.message))

            })
            .catch(err => res.status(400).json(err.message))

    } else {
        return res.status(403).json("you currently don't own a shop ")
    }


})







// get all products for a particlular shop ( only shop owner can do this request )

router.get('/shop/:id/products', verifyToken, async (req, res) => {

    if (req.user.isShopOwner) {

        Shop.findOne({ "id": req.params.id })
            .then((shop) => {

                console.log(shop)

                Product.find({ "shop": req.params.id }).sort({ createdAt: -1 })
                    .then((products) => {

                        res.status(200).json({
                            ...shop._doc,
                            shop_products: products
                        })

                    })
                    .catch(err => res.status(400).json(err.message))

            })
            .catch(err => res.status(400).json(err.message))

    } else {
        return res.status(403).json("you currently don't own a shop ")
    }

})




const savePictures = async ( req,res,next ) => {

    const Images = []

    if( req.data.product_images.length < 3 || req.data.product_images.length > 3 ){
        return res.status(400).json("Only 3 images are allowed")
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

    const Forloop = async () => {
        
        for (let i = 0; i < req.data.product_images.length; i++) {

            var image = req.data.product_images[i]
            
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


// add products to shop ( only shop owner can do this request )

router.post('/shop/:id/add_product', verifyToken, ShopOwnerVerification , FormidableVefification ,savePictures, async (req, res) => {

                const { error, value } = validateProduct({
                    ...req.data,
                })

                if (error) {
                    console.log(error.details[0].message)
                    DeleteUploadedImage(req.data)
                    return res.status(403).json(error.details[0].message)
                }

                Category.findById(req.data.product_category)
                    .then((category) => {

                        const product_name = req.data.product_name
                        const product_description = req.data.product_description
                        const product_price = Number(req.data.product_price)
                        const product_quantity = Number(req.data.product_quantity)
                        const product_category = category._id
                        const shop_owner = req.user.id
                        const shop = req.params.id
                        const available = true
                        const product_images = [...req.Images]


                        const newProduct = new Product({
                            product_name,
                            product_description,
                            product_price,
                            product_quantity,
                            product_category,
                            shop_owner,
                            shop,
                            available,
                            product_images
                        })

                        newProduct.save()
                        .then((postedproduct) => {
                            return res.status(200).json(postedproduct)

                        })
                        .catch(err => {
                            let messageError = MongoDBerrorformat(err)
                            console.log(err)
                            DeleteUploadedImage(req.Images)
                            return res.status(403).json(messageError)

                        })

                    })
                    .catch(err => {
                        let messageError = MongoDBerrorformat(err,"Category")
                        console.log(err)
                        DeleteUploadedImage(req.Images)
                        return res.status(403).json(messageError)
                })



})




module.exports = router