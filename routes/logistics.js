const router = require("express").Router();
const { verifyToken } = require("../auth/verifytoken");
const multer = require("multer")
const fs = require('fs')
const path = require('path');
const Logistics = require("../models/logistics_model");
const { validateLogistics } = require("../validator/logisticsvalidator");
const { Joierrorformat, MongoDBerrorformat } = require("../err/error_edit");




const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'logistics_images')
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



router.get('/', async (req, res) => {

    const { page = 1, limit = 10 } = req.query
    const search = req.query.search || "";

    Logistics.find({ logistics_name: { $regex: search, $options: "i" } }).limit(limit * 1).skip((page - 1) * limit).sort({ _id: 1 })
        .then((logistics) => res.status(200).json(logistics))
        .catch((err) => res.status(403).json(err.message))

})



router.get('/logistic/:id', async (req, res) => {

    Logistics.findOne({ "_id": req.params.id })
        .then(logistic => res.status(200).json(logistic))
        .catch(err => res.status(403).json(err.message))

})



router.post('/add_logistics', verifyToken, upload.array('logistics_image', 1), async (req, res) => {

    if (req.user.isLogistics) {

        const { error, value } = validateLogistics({
            ...req.body,
            logistics_image: req.files
        })

        if (error) {
            deleteallpostedfiles(req.files)
            let error_message = Joierrorformat(error.details[0])

            return res.status(403).json(error_message)
        }

        const existingLogistics = await Logistics.findOne({ logistics_name: req.body.logistics_name });

        if (existingLogistics) {
            deleteallpostedfiles(req.files)
            return res.status(403).json("That name has been taken")
        }

        const logistics_owner = req.user.id
        const logistics_name = req.body.logistics_name
        const logistics_description = req.body.logistics_description
        const logistics_vehicles = [...req.body.logistics_vehicles]
        const logistics_coverage = [...req.body.logistics_coverage]
        const logistics_country = req.body.logistics_country
        const logistics_state = req.body.logistics_state
        const logistics_lga = req.body.logistics_lga
        const logistics_address = req.body.logistics_address
        const logistics_email = req.body.logistics_email
        const logistics_phoneNumber = req.body.logistics_phoneNumber
        const logistics_image = req.files

        const newLogistics = new Logistics({
            logistics_owner,
            logistics_name,
            logistics_description,
            logistics_vehicles,
            logistics_coverage,
            logistics_country,
            logistics_state,
            logistics_lga,
            logistics_address,
            logistics_email,
            logistics_phoneNumber,
            logistics_image
        })


        newLogistics.save()
            .then((logistics) => res.status(200).json(logistics))
            .catch((err) => {
                deleteallpostedfiles(req.files)
                let error_message = MongoDBerrorformat(err)

                return res.status(403).json(error_message)
            })

    } else {
        deleteallpostedfiles(req.files)
        return res.status(403).json("you are not yet eligible to own a logistics")
    }

})




module.exports = router