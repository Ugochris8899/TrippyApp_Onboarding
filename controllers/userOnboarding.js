require( 'dotenv' ).config();
const userModel = require( '../trippy_models/userModel');
const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// create a nodemailer transporter
const transporter = nodemailer.createTransport( {
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
    }
});

 // SignUp
 const signUp = async ( req, res ) => {
    try {
        // get all data from the request body
        const { firstName,lastName, email, password } = req.body;
        // check if the entry email exist
        const isEmail = await userModel.findOne( { email } );
        if ( isEmail ) {
            res.status( 400 ).json( {
                message: `user with this email: ${email} already exist.`
            })
        } else {
            // salt the password using bcrypt
            const saltedPassword = await bcrypt.genSalt( 10 );
            // hash the salted password using bcrypt
            const hashedPassword = await bcrypt.hash( password, saltedPassword )

            // create a token
            const token = await jwt.sign( { email }, process.env.JWT_SECRETE, { expiresIn: "50m" } );
        
            // create a user
            const user = new userModel( {
                firstName,
                lastName,
                email,
                password: hashedPassword
                
            } );
            
            // send verification email
            const baseUrl = process.env.BASE_URL
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: "Verify your account",
                html: `Please click on the link to verify your email: <a href="${baseUrl}/users/verify-email/${ token }">Verify Email</a>`,
            };

            await transporter.sendMail( mailOptions );

            user.token = token

            // save the user
            const savedUser = await user.save();

            // return a response
            res.status( 201 ).json( {
            message: `Check your email: ${savedUser.email} to verify your account.`,
            data: savedUser 
        })
        }
    } catch (error) {
        res.status( 500 ).json( {
            message: error.message
        })
    }
}

 // verify email
 const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // verify the token
        const { email } = jwt.verify( token, process.env.JWT_SECRETE );

        const user = await userModel.findOne( { email } );

        // update the user verification
        user.isVerified = true;

        // save the changes
        await user.save();

        // update the user's verification status
        const updatedUser = await userModel.findOneAndUpdate( {email}, user );

        res.status( 200 ).json( {
            message: "User verified successfully",
            data: updatedUser,
        })
        // res.status( 200 ).redirect( `${ process.env.BASE_URL }/login` );

    } catch ( error ) {
        res.status( 500 ).json( {
            message: error.message
        })
    }
}

  // resend verification
  const resendVerificationEmail = async (req, res) => {
    try {
        // get user email from request body
        const { email } = req.body;

        // find user
        const user = await userModel.findOne( { email } );
        if ( !user ) {
            return res.status( 404 ).json( {
                error: "User not found"
            } );
        }

        // create a token
            const token = await jwt.sign( { email }, process.env.JWT_SECRETE, { expiresIn: "50m" } );
            
             // send verification email
            const baseUrl = process.env.BASE_URL
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: user.email,
                subject: "Email Verification",
                html: `Please click on the link to verify your email: <a href="http://localhost:1111/api/users/verify-email/${ token }">Verify Email</a>`,
            };

            await transporter.sendMail( mailOptions );

        res.status( 200 ).json( {
            message: `Verification email sent successfully to your email: ${user.email}`
        } );

    } catch ( error ) {
        res.status( 500 ).json( {
            message: error.message
        })
    }
}

 // signIn
 const signIn = async ( req, res ) => {
    try {
        // extract the user email and password
        const { email, password } = req.body;
        // find user by their registered email
        const user = await userModel.findOne( { email } );
        
        // check if email exist
        if ( !user ||  !user.isVerified) {
            return res.status( 404 ).json( {
                message: `User with this email: ${email} is not verified.`
            })
        } {
            // compare user password with the saved password.
            const isPassword = await bcrypt.compare( password, user.password );
            // check for password error
            if ( !isPassword ) {
                return res.status( 400 ).json( {
                    message: "Incorrect password"
                })
            } else {
                // save the generated token to "token" variable
                const token = await genToken( user )

                user.token = token
                await user.save();
                // return a response
                res.status( 200 ).json( {
                    message: "Sign In successful",
                    data: user
                })
            }
        }
    } catch ( error ) {
        res.status( 500 ).json( {
            message: error.message
        })
    }
}

const genToken = async ( user ) => {
    const token = await jwt.sign( {
        userId: user._id,
        // firstName: user.firstName,
        email: user.email,
    }, process.env.JWT_SECRETE, {expiresIn: "50m"} )
    
    return token;
}

// Change password
const changePasword = async(req, res) =>{
    try {
        const {oldPassword, password} = req.body;
        const id = req.params.id;
        const user = await userModel.findById(id);
        // check if email exist
        if ( !user ||  !user.isVerified) {
            res.status( 404 ).json( {
                message: `User with this email: ${email} is not found.`
            })
        } {
            // compare user password with the saved password.
            const isPassword = await bcrypt.compare( oldPassword, user.password );
            // check for password error
            if ( !isPassword ) {
                res.status( 400 ).json( {
                    message: "Incorrect password"
                })
            } else {
                // save the generated token to "token" variable
                const token = await genToken( user )
                
                // salt the password using bcrypt
        const saltedRound = await bcrypt.genSalt( 10 );
        // hash the salted password using bcrypt
        const hashedPassword = await bcrypt.hash( password, saltedRound );
        const bodyData = {
            password: hashedPassword
        } 
         const changedPassword = await userModel.findByIdAndUpdate(id, bodyData, {new: true})
         return res.status(201).json({
            message: "Password changed Successfully"
        
         })
            }
        }
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

// forgot password
const forgotPassword = async(req, res) =>{
    try {
        const {email} = req.body;

        // check if the email exists in the database
        const user = await userModel.findOne({email});
        if(!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        //Generate a temporary token for password reset
        const resetToken = await jwt.sign( { email }, process.env.JWT_SECRETE, { expiresIn: "30m" });

        // send an email with the reset token
        const transporter = nodemailer.createTransport( {
            service: "Gmail",
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASSWORD,
            }
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset",
            text: `Please click on the link to reset your password: <a href="http://localhost:1111/api/users/verify-email/${ resetToken }">Forgot Password</a>`,
             
        };
          
            transporter.sendMail(mailOptions, (error,info) =>{
            if (error) {
                
                return res.status(500).json({
                    error: 'failed to send reset email.'
                });
                    } else {
                        
                        res.json({message: 'Reset password sent successfully.'})
                    }
            })
         } catch (error) {
       
        res.status(500).json({
            error:'An internal server error occurred'
        })
    }

}


// to signout/logout 
const signOut = async(req, res) =>{
    try {
        const userId = req.params.id;
        //update the user's token to null
        const user = await userModel.findByIdAndUpdate(userId, {token:null}, {new:true});
        if(!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        // console.log(user.token)
        res.status(200).json({
            message: "User logged out successfully",
            // data: user
        })
    } catch (error) {
        res.status(500).json({
            Error:error.message,
        })
    }
}

const oneUser = async(req,res)=>{
    try {
     const userId = req.params.userId;
     const user = await userModel.findById(userId)
 
     res.status(200).json({
         message: "user available",
         data: user
     })
    } catch (error) {
     res.status(404).json({
         message: error.message
     })
    }
 }

 
const allUsers = async(req,res)=>{
    try {
        const users = await userModel.find()
        return res.status(200).json({
            message: "Users available are "+ users.length,
            data: users
        })
    } catch (error) {
        res.status(404).json({
            message:error.message
        })
    }
}

// update admin
const Admin = async(req, res) =>{
    try {
        const adminId = req.params.adminId;
        const Admin = await userModel.findByIdAndUpdate(adminId,{isAdmin: true}, {new:true})
        
        res.status(201).json({
            message: "Admin updated successfully",
            data: Admin
        })
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}
    // to update a user information as an admin
const update = async(req, res) =>{
    try {
        const userId = req.params.userId;
        const updated = await userModel.findByIdAndUpdate(userId, req.body, {new:true})
        if (!update) {
        res.status(404).json({
            message: "Unable to update user",
            
        })
    } else {
        res.status(200).json({
            message: "updated successfully",
            data: updated
        })
    }
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

const deleteUser = async(req, res) =>{
    try {
       const userId = req.params.userId
        const deleteUser = await userModel.findByIdAndDelete(userId)
        if (!deleteUser) {
        res.status(404).json({
            message: "Unable to delete user",
        })
    
    } else {
        res.status(200).json({
            message: "deleted successfully",
            data: deleteUser
        })
    }
} catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}



module.exports = {
    signUp,
    verifyEmail,
    resendVerificationEmail,
    signIn,
    changePasword,
    forgotPassword,
    signOut,
    oneUser,
    allUsers,
    update,
    deleteUser,
    Admin
    

}