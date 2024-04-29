import express from "express";
import {
	followUnFollowUser,
	followUser,
	acceptFollowRequest,
	deleteFollowRequest,
	getUserProfile,
	loginUser,
	logoutUser,
	signupUser,
	updateUser,
	getSuggestedUsers,
	freezeAccount,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.post("/acceptFollowRequest/:id", protectRoute, acceptFollowRequest);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/followRequest/:id", protectRoute, followUnFollowUser); // Toggle state(follow/unfollow)
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);
router.post("/follow/:id", protectRoute, followUser);
router.delete("/deleteFollowRequest/:id", protectRoute, deleteFollowRequest);


export default router;
