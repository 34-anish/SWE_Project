import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const getUserProfile = async (req, res) => {
	// We will fetch user profile either with username or userId
	// query is either username or userId
	const { query } = req.params;

	try {
		let user;

		// query is userId
		if (mongoose.Types.ObjectId.isValid(query)) {
			user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
		} else {
			// query is username
			user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
		}

		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getUserProfile: ", err.message);
	}
};

const signupUser = async (req, res) => {
	try {
		const { name, email, username, password } = req.body;
		const user = await User.findOne({ $or: [{ email }, { username }] });

		if (user) {
			return res.status(400).json({ error: "User already exists" });
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			name,
			email,
			username,
			password: hashedPassword,
		});
		await newUser.save();

		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);

			res.status(201).json({
				_id: newUser._id,
				name: newUser.name,
				email: newUser.email,
				username: newUser.username,
				bio: newUser.bio,
				profilePic: newUser.profilePic,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

const loginUser = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or password" });

		if (user.isFrozen) {
			user.isFrozen = false;
			await user.save();
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			username: user.username,
			bio: user.bio,
			profilePic: user.profilePic,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
		console.log("Error in loginUser: ", error.message);
	}
};

const logoutUser = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 1 });
		res.status(200).json({ message: "User logged out successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

const followUnFollowUser = async (req, res) => {
	// try {
	// 	const { id } = req.params;
	// 	const userToModify = await User.findById(id);
	// 	const currentUser = await User.findById(req.user._id);

	// 	if (id === req.user._id.toString())
	// 		return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

	// 	if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

	// 	const isFollowing = currentUser.following.includes(id);

	// 	if (isFollowing) {
	// 		// Unfollow user
	// 		await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
	// 		await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
	// 		res.status(200).json({ message: "User unfollowed successfully" });
	// 	} else {
	// 		// Follow user
	// 		await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
	// 		await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
	// 		res.status(200).json({ message: "User followed successfully" });
	// 	}
	// } catch (err) {
	// 	res.status(500).json({ error: err.message });
	// 	console.log("Error in followUnFollowUser: ", err.message);
	// }

	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);
	  
		if (id === req.user._id.toString())
		  return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
	  
		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });
	  
		const hasRequested = userToModify.followRequests.includes(req.user._id.toString());
	  
		if (hasRequested) {
		  // Cancel follow request
		  await User.findByIdAndUpdate(id, { $pull: { followRequests: req.user._id } });
		  res.status(200).json({ message: "Follow request cancelled" });
		} else {
		  // Send follow request
		  await User.findByIdAndUpdate(id, { $push: { followRequests: req.user._id } });
		  res.status(200).json({ message: "Follow request sent" });
		}
	  } catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in followUnFollowUser: ", err.message);
	  }
};


const acceptFollowRequest = async (req, res) => {
	try {
	  const { id } = req.params; // ID of the user who sent the follow request
	  const currentUser = await User.findById(req.user._id);
  
	  if (!currentUser) return res.status(400).json({ error: "User not found" });
  
	  // Check if the follow request exists
	  const hasRequested = currentUser.followRequests.includes(id);
	  if (!hasRequested) {
		return res.status(400).json({ error: "Follow request not found" });
	  }
  
	  // Remove the follow request
	  await User.findByIdAndUpdate(req.user._id, { $pull: { followRequests: id } });
  
	  // Add the requester to the current user's followers list
	  await User.findByIdAndUpdate(req.user._id, { $push: { followers: id } });
  
	  await User.findByIdAndUpdate(id, { $push: { following: req.user._id } });

	  res.status(200).json({ name: req.user.username, _id: req.user._id, message: "Follow request accepted successfully" });
	} catch (error) {
	  res.status(500).json({ error: "An error occurred while accepting the follow request" });
	}
  };
 
const deleteFollowRequest = async (req, res) => {
	try {
	  const user = await User.findById(req.user._id);
	  if (!user) {
		return res.status(404).json({ error: "User not found" });
	  }
  
	  const requesterIndex = user.followRequests.indexOf(req.params.id);
	  if (requesterIndex === -1) {
		return res.status(404).json({ error: "Follow request not found" });
	  }
  
	  // Remove the follow request
	  await User.findByIdAndUpdate(req.user._id, { $pull: { followRequests: req.params.id } });
  
	  res.status(200).json({ message: "Follow request deleted" });
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
};

const updateUser = async (req, res) => {
	const { name, email, username, password, bio } = req.body;
	let { profilePic } = req.body;

	const userId = req.user._id;
	try {
		let user = await User.findById(userId);
		if (!user) return res.status(400).json({ error: "User not found" });

		if (req.params.id !== userId.toString())
			return res.status(400).json({ error: "You cannot update other user's profile" });

		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			user.password = hashedPassword;
		}

		if (profilePic) {
			if (user.profilePic) {
				await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profilePic);
			profilePic = uploadedResponse.secure_url;
		}

		user.name = name || user.name;
		user.email = email || user.email;
		user.username = username || user.username;
		user.profilePic = profilePic || user.profilePic;
		user.bio = bio || user.bio;

		user = await user.save();

		// Find all posts that this user replied and update username and userProfilePic fields
		await Post.updateMany(
			{ "replies.userId": userId },
			{
				$set: {
					"replies.$[reply].username": user.username,
					"replies.$[reply].userProfilePic": user.profilePic,
				},
			},
			{ arrayFilters: [{ "reply.userId": userId }] }
		);

		// password should be null in response
		user.password = null;

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in updateUser: ", err.message);
	}
};

const getSuggestedUsers = async (req, res) => {
	try {
		// exclude the current user from suggested users array and exclude users that current user is already following
		const userId = req.user._id;

		const usersFollowedByYou = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);
		const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const freezeAccount = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		user.isFrozen = true;
		await user.save();

		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const followUser = async (req, res) => {
	try {
	  if (req.user._id.toString() === req.params.id) {
		return res.status(400).json({ error: "You can't follow yourself" });
	  }
  
	  const requester = await User.findById(req.user._id);
	  const userBeingFollowed = await User.findById(req.params.id);
  
	  // Add the user being followed to the requester's following list
	  requester.following.push(req.params.id);
	  await requester.save();
  
	  // Add the requester to the user being followed's followers list
	  userBeingFollowed.followers.push(req.user._id);
	  await userBeingFollowed.save();
  
	  res.json({ message: "Followed user successfully" });
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
  };
export {
	signupUser,
	loginUser,
	logoutUser,
	followUnFollowUser,
	acceptFollowRequest,
	deleteFollowRequest,
	updateUser,
	followUser,
	getUserProfile,
	getSuggestedUsers,
	freezeAccount,
};
