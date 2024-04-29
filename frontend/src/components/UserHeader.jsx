import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
// import useFollowUnfollow from "../hooks/useFollowUnfollow";
import  useFollowUnfollow  from '../hooks/useFollowUnfollow';
import React, { useEffect, useState } from 'react';

const UserHeader = ({ user }) => {

	const currentUser = useRecoilValue(userAtom); 
	const { handleFollowUnfollow, handleAcceptFollowRequest, handleDeleteFollowRequest, following, updating } = useFollowUnfollow(user);
	const [requesters, setRequesters] = useState([]);

	useEffect(() => {
	  const fetchRequesters = async () => {
		const fetchedRequesters = await Promise.all(
		  user.followRequests.map((requesterId) =>
			fetch(`/api/users/profile/${requesterId}`).then((res) => res.json())
		  )
		);
		setRequesters(fetchedRequesters);
	  };
  
	  fetchRequesters();
	}, [user.followRequests]);
	
	return (
		<VStack gap={4} alignItems={"start"}>
			<Flex justifyContent={"space-between"} w={"full"}>
				<Box>
					<Text fontSize={"2xl"} fontWeight={"bold"}>
						{user.name}
					</Text>
				</Box>
				<Box>
					
				
				{/* <Box> */}
					{user.profilePic && (
						<Avatar
							name={user.name}
							src={user.profilePic}
							size={{
								base: "md",
								md: "xl",
							}}
						/>
					)}
					{!user.profilePic && (
						<Avatar
							name={user.name}
							src='https://bit.ly/broken-link'
							size={{
								base: "md",
								md: "xl",
							}}
						/>
					)}
				</Box>
			</Flex>

			<Text>{user.bio}</Text>
			{/* <Box>
				<Text fontSize="lg" fontWeight="bold">Connection Requests</Text>
				{user.followRequests.length > 0 ? (
					user.followRequests.map((requesterId) => (
					<Box key={requesterId} p={3} border="1px solid" borderColor="gray.200" borderRadius="md" mb={3}>
						<Text>{requesterId}</Text>  {
						// replace with user name
						}
						<Button onClick={() => handleAcceptFollowRequest(requesterId)} size="sm" colorScheme="blue" mt={2}>
						Accept
						</Button>
					</Box>
					))
				) : (
					<Text color="gray.500">No connection requests</Text>
				)}
			</Box> */}
			{currentUser._id === user._id && (<Box>
				<Text fontSize="lg" fontWeight="bold">Connection Requests</Text>
				{requesters.length > 0 ? (
					requesters.map((requester) => (
					<Box key={requester._id} p={3} border="1px solid" borderColor="gray.200" borderRadius="md" mb={3}>
						<Text>{requester.username}</Text>
						<Button onClick={() => handleAcceptFollowRequest(requester._id)} size="sm" colorScheme="blue" mt={2}>
						Accept
						</Button>
						<Button onClick={() => handleDeleteFollowRequest(requester._id)} size="sm" colorScheme="red" mt={2} ml={2}>
							Delete
						</Button>
						
					</Box>
					))
				) : (
					<Text color="gray.500">No connection requests</Text>
				)}
			</Box>)}
			{currentUser?._id !== user._id ? (
						<Button onClick={handleFollowUnfollow} isLoading={updating} size={"sm"}>
						{following ? "Remove" : "Connect"}
						</Button>
					) : null
					// : (
					// 	// <Button onClick={() => handleAcceptFollowRequest(user.followRequests[0])} size={"sm"}>
					// 	// Accept Follow Request
					// 	// </Button>
					// 	requesters.length > 0 ? (
					// 		<Button onClick={() => handleAcceptFollowRequest(user.followRequests[0])} size={"sm"}>
					// 		  Accept Follow Request
					// 		</Button>
					// 	  ) : null 
					// )
				}
			<Flex w={"full"} justifyContent={"space-between"}>
				<Flex gap={2} alignItems={"center"}>
					<Text color={"gray.light"}>{user.followers.length} followers</Text>
				</Flex>

				{currentUser?._id === user._id && (
				<Link as={RouterLink} to='/update'>
					<Button size={"sm"}>Update Profile</Button>
				</Link>
				)}
				
			</Flex>

			<Flex w={"full"}>
				<Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb='3' cursor={"pointer"}>
					<Text fontWeight={"bold"}> Posts</Text>
				</Flex>
				<Flex
					flex={1}
					borderBottom={"1px solid gray"}
					justifyContent={"center"}
					color={"gray.light"}
					pb='3'
					cursor={"pointer"}
				>
				</Flex>
			</Flex>
		</VStack>
	);
};

export default UserHeader;
