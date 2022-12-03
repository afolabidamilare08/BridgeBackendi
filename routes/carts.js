const router = require("express").Router();
const Cart = require('../models/cart_model');
const Product = require('../models/product_model');
const { verifyTokenAndAdmin, verifyToken, verifyTokenAndAdminAndCartOwner } = require("../auth/verifytoken");
const { validateaddtocart } = require("../validator/add_to_cart_validator");
const { Joierrorformat } = require("../err/error_edit");








// get all the carts ( only admin can do this request )

router.get('/', verifyTokenAndAdmin, async (req, res) => {

    Cart.find().sort({ _id: -1 })
        .then((carts) => {

            res.status(200).json(carts)

        })
        .catch((err) => res.status(403).json(err.message))

})







// get specified user cart details ( only admin can do this request )

router.get('/:id', verifyTokenAndAdmin, async (req, res) => {

    Cart.findById(req.params.id)
        .then((cart) => res.status(200).json(cart))
        .catch(err => res.status(403).json(err.message))

})








// get current user cart ( only user with token can do this request )

router.get('/cart/mycart/', verifyToken, async (req, res) => {

    Cart.findOne({ "cart_owner": req.user.id })
        .then((cart) => {

            res.status(200).json(cart)

        })
        .catch(err => res.status(403).json(err.message))

})







// add to current user cart ( only user with token can do this request )

router.post('/cart/mycart/add_to_cart', verifyTokenAndAdminAndCartOwner, async (req, res) => {


    const { error, value } = validateaddtocart(req.body)

    if (error) {

        let error_message = Joierrorformat(error.details[0])

        return res.status(403).json(error_message)
    }

    Product.findById(req.body.product_id)
        .then((product) => {

            var emcart_products = []
            const previous_cart_list = req.cart.cart_products


            const ProductQuantity = parseInt(req.body.product_quantity)
            const ProductCost = ProductQuantity * parseInt(product.product_price)


            if (previous_cart_list.length > 0) {

                emcart_products = [...previous_cart_list]

                for (let i = 0; i < previous_cart_list.length; i++) {

                    const current_product = previous_cart_list[i]

                    if (current_product.product_id == req.body.product_id || current_product.product_id === req.body.product_id) {

                        var edit_product = {
                            product: product,
                            product_id: product.id,
                            quantity: Number(ProductQuantity),
                            total_product_price: Number(ProductCost)
                        }

                        emcart_products.splice(i, 1, edit_product)
                        break;
                    }

                    else {

                        const isLAst = previous_cart_list.length - 1

                        if (isLAst === i && current_product.product_id !== req.body.product_id) {

                            emcart_products.push({
                                product: product,
                                product_id: product.id,
                                quantity: Number(ProductQuantity),
                                total_product_price: Number(ProductCost)
                            })

                        }

                    }

                }

            } else {

                if (previous_cart_list.length === 0) {

                    emcart_products.push({
                        product: product,
                        product_id: product.id,
                        quantity: Number(ProductQuantity),
                        total_product_price: Number(ProductCost)
                    })

                }

            }

            var total_cart_cost = 0

            for (let b = 0; b < emcart_products.length; b++) {

                total_cart_cost = total_cart_cost + emcart_products[b].total_product_price

            }

            Cart.findOneAndUpdate(
                { "cart_owner": req.user.id },
                {
                    $set: {
                        cart_products: emcart_products,
                        cart_total: total_cart_cost
                    }
                },
                { new: true })
                .then((cart) => res.status(200).json(cart))
                .catch(err => res.status(403).json(err))






        })
        .catch(err => res.status(403).json(err.message))

})







// remove from current user cart ( only user with token can do this request )

router.post('/cart/mycart/remove_from_cart', verifyTokenAndAdminAndCartOwner, async (req, res) => {

    const { error, value } = validateaddtocart(req.body)

    if (error) {
        let error_message = Joierrorformat(error.details[0])

        return res.status(403).json(error_message)
    }

    Product.findById(req.body.product_id)
        .then((product) => {

            const previous_cart_list = req.cart.cart_products
            var emcart_products = [...previous_cart_list]


            if (previous_cart_list.length > 0) {

                emcart_products = [...previous_cart_list]

                for (let i = 0; i < previous_cart_list.length; i++) {

                    const current_product = previous_cart_list[i]

                    if (current_product.product_id == req.body.product_id || current_product.product_id === req.body.product_id) {

                        emcart_products.splice(i, 1)
                        break;
                    }

                }

            }

            var total_cart_cost = 0

            for (let b = 0; b < emcart_products.length; b++) {

                total_cart_cost = total_cart_cost + emcart_products[b].total_product_price

            }

            Cart.findOneAndUpdate(
                { "cart_owner": req.user.id },
                {
                    $set: {
                        cart_products: emcart_products,
                        cart_total: total_cart_cost
                    }
                },
                { new: true })
                .then((cart) => res.status(200).json(cart))
                .catch(err => res.status(403).json(err))

        })
        .catch(err => res.status(403).json(err))

})



module.exports = router
