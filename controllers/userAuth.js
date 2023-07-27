const jwt = require("jsonwebtoken");
const userModel = require("../trippy_models/userModel");

const authentication = async(req, res, next) => {
    try {
        const user = await userModel.findById(req.params.id);
        const userToken = user.token

        if(!userToken) {
            res.status(400).json("Token not found")
        }

        await jwt.verify(userToken, process.env.JWT_SECRETE,(err, payLoad) =>{
            if(err){res.json(err.message)}
            else{
                req.user = payLoad
                
                next();
            }
        })

    } catch (error) {
        res.json(error.message)
        
    }
}




exports.checkUser = async(req, res, next) =>{
    authentication(req, res, async()=>{
        const users = await userModel.findById(req.params.id)

        if(users.isAdmin ){
            next()
        } else {
            res.json("you are not authorized to perform this operation ")
        }
    })
}