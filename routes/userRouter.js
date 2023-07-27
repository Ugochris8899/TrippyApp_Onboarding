const express = require( 'express' );
const router = express.Router();

const { checkUser, superAuth, authenticate } = require("../controllers/userAuth");

const { signUp, verifyEmail, resendVerificationEmail, signIn, signOut, changePasword, forgotPassword, oneUser, allUsers, update,deleteUser, Admin } = require( '../controllers/userOnboarding' );


router.route( "/users/sign-up" ).post( signUp );

router.route( "/users/verify-email/:token" ).get( verifyEmail );

router.route( "/users/resend-verification-email" ).post( resendVerificationEmail );
    
router.route( "/users/sign-in" ).post( signIn );

router.route( "/changePassword/:id" ).patch(changePasword);

router.route( "/forgotPassword/:id" ).post(forgotPassword);

router.route("/logout/:id").post(signOut);

router.route("/:id/oneUser/:userId").get(checkUser,oneUser)

router.route("/:id/allUser").get(checkUser, allUsers)

router.route("/updateUser/:id/:userId").patch(checkUser, update)

router.route("/delete/:id/:userId").delete(checkUser, deleteUser)

router.route("/admin/:adminId").patch( Admin)

module.exports = router;