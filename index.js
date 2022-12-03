const express = require("express");
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  secure: true,
  cloud_name:"drcn2xv3q",
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})

dotenv.config();
app.use(express.json())



const authRouter = require('./routes/auth');
const UserRouter = require('./routes/user');
const ShopRouter = require('./routes/shop');
const CategoryRouter = require('./routes/category');
const ProductRouter = require('./routes/products');
const CartRouter = require('./routes/carts');
const OrderRouter = require('./routes/orders');
const ReturningUserRouter = require('./routes/returningUser');
const VehicleRouter = require('./routes/vehicle')
const LogisticsRouter = require('./routes/logistics')
const AddressRouter = require('./routes/address');
const OtpRouter = require('./routes/otp');
const NotificationRouter = require('./routes/notifications');



app.use(
  cors({
    origin: "*",
    method: '*',
    credentials: true
  })
)


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}



mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
const connection = mongoose.connection;


connection.once('open', () => {
  console.log('MongoDB database was able to connect successfully')
})







app.use('/', ProductRouter)
app.use('/auth', authRouter)
app.use('/users', UserRouter)
app.use('/shops', ShopRouter)
app.use('/categories', CategoryRouter)
app.use('/products', ProductRouter)
app.use('/carts', CartRouter)
app.use('/orders', OrderRouter)
app.use('/returnUser', ReturningUserRouter)
app.use('/vehicles', VehicleRouter)
app.use('/logistics', LogisticsRouter)
app.use('/address',AddressRouter)
app.use('/otp',OtpRouter)
app.use('/notification',NotificationRouter)


app.use(express.static('public'))
app.use('/public', express.static('public'))


app.use(express.static('/products_images'))
app.use('/products_images', express.static('products_images'))


app.use(express.static('/users_images'))
app.use('/users_images', express.static('users_images'))

app.use(express.static('/shops_images'))
app.use('/shops_images', express.static('shops_images'))

app.use(express.static('/logistics_images'))
app.use('/logistics_images', express.static('logistics_images'))


 


// app.listen(process.env.LOCAL_HOST_PORT, () => {
//   console.log("Backend Server is running")
// })  

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));