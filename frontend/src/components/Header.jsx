import { Box, Menu,  MenuItem, MenuList, Input, Spacer, Text, Button, Flex, Image, Link, useColorMode } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
// import { FiSearch as Search } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Header = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const user = useRecoilValue(userAtom);
	const logout = useLogout();
	const setAuthScreen = useSetRecoilState(authScreenAtom);
	const [searchText, setSearchText] = useState("");
	const showToast = useShowToast();
	const [searchingUser, setSearchingUser] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const navigate = useNavigate();
	
	// const handleInputChange = (event) => {
	// 	setSearchTerm(event.target.value);
	// 	onSearch(event.target.value);
	// };

	// const onSearch = async (value) => {
	// 	const response = await fetch(`/profile/${value}`);
	// 	if (response.ok) {
	// 	  const user = await response.json();
	// 	  navigate(`/profile/${user.username}`);
	// 	} else {
	// 	  console.log('User not found');
	// 	}
	//   };
	
	// const handleFormSubmit = async (event) => {
	// 	event.preventDefault();
	// 	const response = await fetch(`/profile/${searchTerm}`);
	// 	if (response.ok) {
	// 	  const user = await response.json();
	// 	  navigate(`/profile/${user.username}`);
	// 	} else {
	// 	  console.log('User not found');
	// 	}
	// };
	const handleSearch = async(e)=>{
		e.preventDefault();
		try{
			const res = await fetch(`/api/users/profile/${searchText}`);
			const searchedUser = await res.json();
			console.log(searchedUser);
			if (searchedUser.error) {
				showToast("Error", searchedUser.error, "error");
				return;
			}
			setSearchResults([searchedUser]);
		}catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setSearchingUser(false);
		}
	}


	return (
		<Flex justifyContent={"center"} mt={6} mb='12'>
			{/* {user && (
				<Link as={RouterLink} to='/'>
					<AiFillHome size={24} />
				</Link>
			)}
			{!user && (
				<Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")} color= {"blackAlpha.700"}>
					Login
				</Link>
			)} */}

			{/* <Image
				cursor={"pointer"}
				alt='logo'
				w={6}
				src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
				onClick={toggleColorMode}
			/> */}
			{
			<Text
				cursor={"pointer"}
				fontSize={"4xl"} 
				color={"#2BB3FF"} 
				onClick={toggleColorMode}
			>
				Connecta
			</Text>
			}
			<Spacer />
			{/* <form onSubmit={handleSearch}>
				<Input 
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					placeholder="Search user"
				/>
			</form> */}
			{user && (<Box position="relative">
				<form onSubmit={handleSearch}>
					<Input 
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					placeholder="Search user"
					/>
				</form>
				{searchResults.length > 0 && (
					<Box
					position="absolute"
					top="100%"
					width="100%"
					bg="white"
					boxShadow="md"
					zIndex="dropdown"
					>
					{searchResults.map(user => (
						<Flex key={user._id} onClick={() => navigate(`/${user.username}`)} alignItems="center" p={2}>
						<Image 
						  src={user.profilePic} 
						  alt={user.username} 
						  boxSize="40px" 
						  borderRadius="full" 
						  objectFit="cover" 
						  mr={2}
						/>
						<Text>{user.username}</Text>
					  </Flex>
					))}
					</Box>
				)}
			</Box>
		)}
			{<Spacer />}	
			{user && (
				<Flex alignItems={"center"}  gap={4}>
					<Link as={RouterLink} to={`/${user.username}`} color={'blackAlpha.900'}>
						<RxAvatar size={24} />
					</Link>
					<Link as={RouterLink} to={`/chat`} color={'blackAlpha.900'}>
						<BsFillChatQuoteFill size={20} />
					</Link>
					<Link as={RouterLink} to={`/settings`} color={'blackAlpha.900'}>
						<MdOutlineSettings size={20} />
					</Link>
					<Button size={"xs"} onClick={logout} color={'blackAlpha.900'}>
						<FiLogOut size={20} />
					</Button>
				</Flex>
			)}

			{/* {!user && (
				<Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("signup")} color= {"blackAlpha.700"}>
					Sign up
				</Link>
			)} */}
		</Flex>
	);
};

export default Header;
