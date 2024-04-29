import { useState } from "react";
import useShowToast from "./useShowToast";
import userAtom from "../atoms/userAtom";
import { useRecoilValue } from "recoil";

// const useFollowUnfollow = (user) => {
// 	const currentUser = useRecoilValue(userAtom);
// 	const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
// 	const [updating, setUpdating] = useState(false);
// 	const showToast = useShowToast();

// 	const handleFollowUnfollow = async () => {
// 		if (!currentUser) {
// 			showToast("Error", "Please login to follow", "error");
// 			return;
// 		}
// 		if (updating) return;

// 		setUpdating(true);
// 		try {
// 			// const res = await fetch(`/api/users/follow/${user._id}`, {
// 			const res = await fetch(`/api/users/followRequest/${user._id}`, {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 			});
// 			const data = await res.json();
// 			if (data.error) {
// 				showToast("Error", data.error, "error");
// 				return;
// 			}

// 			if (following) {
// 				showToast("Success", `Unfollowed ${user.name}`, "success");
// 				user.followers.pop(); // simulate removing from followers
// 			} else {
// 				showToast("Success", `Followed ${user.name}`, "success");
// 				user.followers.push(currentUser?._id); // simulate adding to followers
// 			}
// 			setFollowing(!following);

// 			console.log(data);
// 		} catch (error) {
// 			showToast("Error", error, "error");
// 		} finally {
// 			setUpdating(false);
// 		}
// 	};

// 	return { handleFollowUnfollow, updating, following };
// };

// export default useFollowUnfollow;

	const useFollowUnfollow = (user) => {
		const currentUser = useRecoilValue(userAtom);
		const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
		const [updating, setUpdating] = useState(false);
		const showToast = useShowToast();

		const handleFollowUnfollow = async () => {
			if (!currentUser) {
			showToast("Error", "Please login to follow", "error");
			return;
			}
			if (updating) return;
		
			setUpdating(true);
			try {
			const res = await fetch(`/api/users/followRequest/${user._id}`, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				},
			});
			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
			} else {
				if (following) {
				showToast("Success", `Cancelled follow request to ${user.name}`, "success");
				// simulate removing from follow requests
				} else {
				showToast("Success", `Sent follow request to ${user.name}`, "success");
				// simulate adding to follow requests
				}
				setFollowing(!following);
			}
			} catch (error) {
			showToast("Error", error.message, "error");
			} finally {
			setUpdating(false);
			}
		};
		
		const handleAcceptFollowRequest = async (requesterId) => {
			try {
				const res = await fetch(`/api/users/acceptFollowRequest/${requesterId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				});
				const data = await res.json();
				console.log("dATA HERE", data)
				if (data.error) {
				showToast("Error", data.error, "error");
				} else {
				showToast("Success", `Accepted follow request from ${data.name}`, "success");
				}
			} catch (error) {
				showToast("Error", error.message, "error");
			}
			};

		const handleDeleteFollowRequest = async (requesterId) => {
				try {
				  const res = await fetch(`/api/users/deleteFollowRequest/${requesterId}`, {
					method: "DELETE",
					headers: {
					  "Content-Type": "application/json",
					},
				  });
				  const data = await res.json();
				  if (data.error) {
					showToast("Error", data.error, "error");
				  } else {
					showToast("Success", `Deleted follow request from ${data.name}`, "success");
					// Update your state here to reflect the changes
				  }
				} catch (error) {
				  showToast("Error", error.message, "error");
				}
			  };
  		return { handleFollowUnfollow, handleAcceptFollowRequest, 
			handleDeleteFollowRequest,
			updating, following };

	}

export default useFollowUnfollow;