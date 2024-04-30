import { Router } from "express";
import { addWatchHistoryMovie, addWishListMovie, changeCurrentPassword, getCurrentUser, getWatchHistory, getWishList, loginUser, logoutUser, refreshAccessToken, registerUser, removeWatchHistoryMovie, removeWishListMovie, updateAvatar } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/register").post(registerUser)


router.route("/login").post(loginUser)

//secured routes

router.route("/getUser").post(verifyJWT , getCurrentUser)

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(verifyJWT , refreshAccessToken)
router.route("/changePassword").post(  verifyJWT ,changeCurrentPassword)
router.route("/upadateAvatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
    )
router.route("/getWatchHistory").get( verifyJWT ,getWatchHistory)
router.route("/getWishList").get(verifyJWT, getWishList)


router.route("/addWishListMovie/:movieId").post(verifyJWT, addWishListMovie)

router.route("/addWatachHistoryMovie/:movieId").post(verifyJWT, addWatchHistoryMovie)

router.route("/removeWishListMovie/:movieId").post(verifyJWT, removeWishListMovie)

router.route("/removeWatachHistoryMovie/:movieId").post(verifyJWT, removeWatchHistoryMovie)





export default router 