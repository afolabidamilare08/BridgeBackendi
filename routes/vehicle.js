const router = require("express").Router();
const { expression } = require("joi");
const { verifyToken, verifyTokenAndAdmin } = require("../auth/verifytoken");
const Vehicle = require('../models/vehicles_model');
const { validateVehicle } = require("../validator/vehiclevalidator");



// getting all shops ( anybody can do it )

router.get('/', async (req, res) => {

    const { page = 1, limit = 10 } = req.query
    // const search = req.query.search || "";

    Vehicle.find().limit(limit * 1).skip((page - 1) * limit).sort({ _id: 1 })
        .then(vehicles => res.status(200).json(vehicles))
        .catch(err => res.status(403).json(err.message))

    // Vehicle.find({ vehicle_name: { $regex: search, $options: "i" } }).sort({ _id: 1 })
    //     .then(vehicles => res.status(200).json(vehicles))
    //     .catch(err => res.status(403).json(err.message))

})








// add vehicle ( only Admins can do this )

router.post('/add_vehicle', verifyTokenAndAdmin, async (req, res) => {

    const { error, value } = validateVehicle(req.body)

    if (error) {
        return res.status(403).json(error.details[0].message)
    }

    const vehicle_name = req.body.vehicle_name
    const vehicle_description = req.body.vehicle_description

    const newVehicle = new Vehicle({
        vehicle_name,
        vehicle_description
    })

    const existingVehicle = await Vehicle.findOne({ vehicle_name: req.body.vehicle_name });

    if (existingVehicle) {
        return res.status(403).json("That name has been taken")
    }

    newVehicle.save()
        .then((vehicle) => res.status(200).json(vehicle))
        .then((err) => res.status(400).json(err.message))

})








// get a specific vehicle ( anybody can do this )

router.get('/vehicle/:id', async (req, res) => {

    Vehicle.findOne({ "_id": req.params.id })
        .then(vehicle => res.status(200).json(vehicle))
        .catch(err => res.status(403).json(err.message))

})








// edit specific vehicle (only admins can do this)

router.put('/vehicle/:id', verifyTokenAndAdmin, async (req, res) => {

    if (req.body.vehicle_name) {

        const existingVehicle = await Vehicle.findOne({ vehicle_name: req.body.vehicle_name });

        if (existingVehicle) {
            return res.status(403).json("Vehicle already exist")
        }

    }

    Vehicle.findOneAndUpdate({ "_id": req.params.id },
        { $set: req.body },
        { new: true })
        .then((vehicle) => res.status(200).json(vehicle))
        .catch((err) => res.status(403).json(err.message))


})



module.exports = router