const router = require("express").Router();
const { verifyTokenAndAdmin } = require("../auth/verifytoken");
const Category = require('../models/category_model');
const { validateCategory } = require("../validator/categoryvalidator");
const { Joierrorformat, MongoDBerrorformat } = require("../err/error_edit");






// get all categories ( anybody can do this request )

router.get('/', (req, res) => {

    Category.find().sort({ _id: -1 })

        .then(categories => {

            res.status(200).json(categories)

        })

        .catch(err => res.status(403).json(err))
})







// add to category list ( only admin can do this request )

router.post('/add_category', verifyTokenAndAdmin, async (req, res) => {

    const { error, value } = validateCategory(req.body)

    if (error) {
        let error_message = Joierrorformat(error.details[0])

        return res.status(403).json(error_message)
    }

    const category_name = req.body.category_name
    const category_description = req.body.category_description

    const NewCategory = new Category({
        category_name,
        category_description
    })

    NewCategory.save()
        .then((category) => res.status(200).json(category))
        .catch((err) => {

            let error_message = MongoDBerrorformat(err)

            return res.status(403).json(error_message)

        })

})







// get specific category ( anybody can do this request )

router.get('/category/:id', async (req, res) => {

    Category.findById(req.params.id)
        .then(category => res.status(200).json(category))
        .catch(err => res.status(403).json(err.message))

})







// edit category ( only admin can do this request )

router.put('/category/:id', verifyTokenAndAdmin, async (req, res) => {

    Category.findByIdAndUpdate(req.params.id,
        { $set: req.body, },
        { new: true })
        .then((category) => res.status(200).json(category))
        .catch(err => {
            let error_message = MongoDBerrorformat(err)

            return res.status(403).json(error_message)
        })

})


module.exports = router