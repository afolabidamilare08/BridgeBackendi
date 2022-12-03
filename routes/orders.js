const router = require("express").Router();
const Order = require('../models/order_model');
const User = require('../models/user_model');
const Notification = require('../models/notifications_model');
const { verifyTokenAndAdmin, verifyToken } = require('../auth/verifytoken');
const Cart = require("../models/cart_model");
const { validateOrder } = require('../validator/ordervalidator');
const { validatereditOrder } = require('../validator/editordervalidator');
const { Joierrorformat, MongoDBerrorformat } = require("../err/error_edit");
const nodemailer = require('nodemailer')



  const SendEmail = async (data) => {

    const OrderId = data._id

    try{
        const UserDetails = await User.findById(data.order_owner)

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'officialagriccong@gmail.com',
              pass: process.env.GMAIL_PASS
            }
          });
    
        var mailOptions = {
            from: 'officialagriccong@gmail.com',
            to: UserDetails.email,
            subject: `Order Confirmed`,
            html: `
            
            <body style="padding:120px; color:black; padding-top:0;" >
            <img
              style="
                display: block;
                margin: 130px auto;
                width: 100px;
                height: 100px;
                margin-bottom: 30px;
              "
              src="https://res.cloudinary.com/drcn2xv3q/image/upload/v1667226479/checked_v3xe0g.png"
            />
            <div style="text-align: center; font-weight: bold; font-size: 25px">
              Thank You For Your Order
            </div>
            <div style="margin-top: 20px; text-align: center">
              We’re happy to let you know that we’ve received your order #${OrderId}. Once your
              package is in transit, we will send you an email to notify you with the
              movement of your package
            </div>
            <div style="margin-top: 50px">
              <div
                style="
                  background-color: lightgray;
                  padding: 20px;
                  display: flex;
                  justify-content: space-between;
                  font-weight: 800;
                "
              >
                <div style="width: 50%">Order Items</div>
                
              </div>
              ${

                data.order_items.map( (sam) => {
                    return ` <div
                    style="
                      padding: 10px;
                      display: flex;
                      justify-content: space-between;
                    "
                  >
                    <div style="width: 80%">${sam.product.product_name} (${sam.quantity})</div>
                    <div style="width: 20%">₦${sam.product.product_price}</div>
                  </div>`
                } )

              }
              <hr />
              <div
                style="
                  padding: 10px;
                  display: flex;
                  justify-content: space-between;
                  margin-top: 20px;
                "
              >
                <div style="width:80%; font-weight: 600">Item total cost</div>
                <div style="width: 20%" style="font-weight: 600">₦${data.order_price}</div>
              </div>
              <div
                style="
                  padding: 10px;
                  display: flex;
                  justify-content: space-between;
                  margin-top: 20px;
                "
              >
                <div style="font-weight: 600;width: 80%">Delivery Fee</div>
                <div style="width: 20%" style="font-weight: 600">₦${data.order_delivery_fee}</div>
              </div>
              <div
                style="
                  padding: 10px;
                  display: flex;
                  justify-content: space-between;
                  margin-top: 20px;
                "
              >
                <div style="font-weight: bold;width: 80%">Total</div>
                <div style="width: 20%" style="font-weight: bold">₦${data.order_price + data.order_delivery_fee }</div>
              </div>
              <hr />
            </div>
            <div
              style="display: flex; margin-top: 40px;
            >
              <div style="width: 35%;">
                <div style="font-weight: bold;">Delivery Address</div>
                ${data.order_address},
                <br/>
                ${data.order_lga},
                <br/>
                ${data.order_state}
              </div>
              <div style="width: 35%; margin-top:20px">
                <div style="font-weight: bold;">
                  Estimated Delivery Date
                </div>
                ${data.delivery_date}
              </div>
            </div>
          </body>

            `
          };
    
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              return { status: "failed",info:error }
            } else {
              console.log('Email sent: ' + info.response);
              return { status: "successfull",info:info.response }
            }
          });

    }catch (err) {
        return { status: "failed",info:err }
    }

  }


  const AddNotification = async (data) => {

    Notification.findOne({"user_id":data.user_id})
      .then( (notification) => {

          var OldNotificationArray = [...notification.user_notifications]
          OldNotificationArray.unshift({
            type:"Order",
            message:data.message,
            order_id:data.order_id,
            dateCreated: new Date()
          })

          Notification.findOneAndUpdate({"user_id":data.user_id},{
            $set:{
              user_notifications:OldNotificationArray,
              status:true
            }
          },{new:true})
            .then( (new_notification) => {
              return 
            } )
            .catch( (err) => {
              console.log(err)
            } )

      } )
      .catch( (err) => console.log(err) )

  }






  const GetDeliveryDate = () => {

    var TheDate = new Date()
    TheDate.setDate( TheDate.getDate() - 1)
    // TheDate.setHours( TheDate.getHours() + 9 )

    var hourmark = TheDate.getHours()
    var min = TheDate.getMinutes()
    var day = TheDate.getDay()
    var month = TheDate.getMonth()
    var year = TheDate.getFullYear() 


    if( hourmark > 6 && hourmark < 20  ){

      if( min > 20 ){
        TheDate.setHours( TheDate.getHours() + 2 )
      }else{
        TheDate.setHours( TheDate.getHours() + 1 )
      }

      hourmark = TheDate.getHours()

      if( hourmark > 13 ){
        hourmark = hourmark - 12
        return(`${hourmark}pm ${day}/${month + 1}/${year}`)
      }

      return(`${hourmark}am ${day}/${month + 1}/${year}`)
    }else{

      if( min > 20 ){
        TheDate.setHours( TheDate.getHours() + 2 )
      }else{
        TheDate.setHours( TheDate.getHours() + 1 )
      }

      if( hourmark > 20  ){
        TheDate.setDate( TheDate.getDate() + 1)
        day = TheDate.getDay()
        month = TheDate.getMonth()
        year = TheDate.getFullYear() 
        return(`${8}am ${day}/${month + 1}/${year}`)
      } 

      if( hourmark < 6 ){
        day = TheDate.getDay()
        month = TheDate.getMonth()
        year = TheDate.getFullYear() 
        return(`${8}am ${day}/${month + 1}/${year}`)
      }
      
    }

  }







// get all orders ( only admin can do this request )

router.get( '/', verifyTokenAndAdmin, async (req,res) => {

    Order.find().sort({_id:-1})
        .then( (orders) => res.status(200).json(orders) )
        .catch( (err) => res.status(400).json(err) )

} )








// Initialize an order ( only user with token can do this request )

router.post( '/create_order' , verifyToken, async (req,res) => {

    const { error, value } = validateOrder(req.body)

    if(error){

        let error_message = Joierrorformat(error.details[0])

        return res.status(403).json(error_message)
    }

    Cart.findOne({"cart_owner":req.user.id})
        .then( (cart) => {

            if( cart.cart_products.length > 0 ){

                const order_items = [ ...cart.cart_products ]
                const order_owner = req.user.id
                const order_status = "pending"
                const order_price = Number(cart.cart_total)
                const order_address = req.body.address
                const order_country = req.body.country
                const order_state = req.body.state
                const order_lga = req.body.lga
                const order_city = req.body.city
                const order_delivery_fee = Number(500)
                const delivery_date = GetDeliveryDate()
    
                const newOrder = new Order({
                    order_owner,
                    order_status,
                    order_items,
                    order_price,
                    order_address,
                    order_country,
                    order_city,
                    order_state,
                    order_lga,
                    order_delivery_fee,
                    delivery_date
                })

                
    
                newOrder.save()
                    .then( (order) => {
    
                        SendEmail(order)
                        AddNotification({
                          user_id:req.user.id,
                          order_id:order.id,
                          message:`Your Order ${order._id} is pending and waiting to be deliverd to you`
                        })

                        Cart.findOneAndUpdate(
                            {"cart_owner":req.user.id},
                            {$set:{
                                cart_products:[],
                                cart_total: Number(0)
                            }},
                            {new:true})
                            .then( (cart) => {
    
                                res.status(200).json({
                                    order:order,
                                    cart:cart
                                })
    
                            } )
                            .catch( err => res.status(400).json(err) ) 
    
                    } )
                    .catch( (err) => res.status(403).json(err) )

            }else{

                res.status(403).json("you can't order an empty cart")

            }


        } )
        .catch( (err) => res.status(400).json(err) )

} )







// get my order for user ( only user with token can do this request )

router.get('/myorders', verifyToken, (req,res) => {

    Order.find({"order_owner":req.user.id}).sort({_id:-1})
        .then( (orders) => res.status(200).json(orders) )
        .catch( err => res.status(400).json(err.message) )

})







// to get individual order

router.get( '/order/:id', verifyToken, async (req,res) => {

    Order.findById(req.params.id)
        .then( (order) => res.status(200).json(order) )
        .catch( err => res.status(403).json(err.message) )

} )







// to edit order by admin and owner only

router.put( '/order/:id', verifyToken, async (req,res) => {

    const { error, value } = validatereditOrder(req.body)

    if( error ){
        return res.status(403).json(error.details[0].message)
    }

    Order.findById(req.params.id)
        .then( order => {

            if( order.order_owner === req.user.id || req.user.isAdmin ){

                if( req.body.status === "pending" ){
                    var order_fresh = {
                        order_status:req.body.status,
                        delivery_date: Date.now() 
                     }
                }else{
                    order_fresh = {
                        order_status:req.body.status
                     }
                }
        
                Order.findByIdAndUpdate(
                    req.params.id,
                    {$set:order_fresh},
                    {new:true})
                    .then( order => res.status(200).json(order) )
                    .catch( err => res.status(403).json(err.message) )
        
            }

        } )
        .catch( err => res.status(403).json(err) )

} )





module.exports = router