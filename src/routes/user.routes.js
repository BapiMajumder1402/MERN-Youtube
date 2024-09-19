import { Router } from "express";
import { upload } from "../middlewares/multer.middelware.js";
import { logInUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(logInUser)
router.route("/logout").post(verifyJWT,logoutUser )
router.route("/refresh-token").post(refreshAccessToken)
export default router;
