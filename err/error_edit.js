const Joierrorformat = (error) => {


    let what_to_return = error.message.replace('\"','')
    what_to_return = what_to_return.replace('\" ',' ')
    what_to_return = what_to_return.replace('_',' ')

    return what_to_return 

}



const MongoDBerrorformat  = (error,unit) => {

    if( error.code === 11000 ){

        if( error.message.includes('username')){
            return "That username has already been taken"
        }

        if( error.message.includes('email')){
            return "That email has already been used"
        }

        if( error.message.includes('phone_number')){
            return "That phone number has already been used"
        }

        if( error.message.includes('category_name')){
            return "Category with that name already exists"
        }

        if( error.message.includes('logistics_owner')){
            return "You can only own one logistics company"
        }

        if( error.message.includes('logistics_name')){
            return "A logistics with that name already exists"
        }

        if( error.message.includes('logistics_email')){
            return "A logistics with that email already exists"
        }

        if( error.message.includes('logistics_phoneNumber')){
            return "A logistics with that phone number already exists"
        }

        if( error.message.includes('product_name_1')){
            return "A Product with that name already exists"
        }

        if( error.message.includes('shop_owner')){
            return "Error Message"
        }

    }else{
        if( error.message.includes('Cannot read properties of null') ){
            return `This ${unit} dose not exist`;
        }
    }

    return error.message

}


module.exports = { Joierrorformat, MongoDBerrorformat }