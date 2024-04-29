import { Box, Input, Spacer, Text, Button, Flex, Image, Link, useColorMode } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import useShowToast from "../hooks/useShowToast";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


const Header = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const user = useRecoilValue(userAtom);
	const logout = useLogout();
	const searchResultsRef = useRef();
	const [searchText, setSearchText] = useState("");
	const showToast = useShowToast();
	const [searchingUser, setSearchingUser] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const navigate = useNavigate();
	
	useEffect(() => {
		const handleClickOutside = (event) => {
		  if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
			setSearchResults([]);
		  }
		};
	  
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
		  document.removeEventListener('mousedown', handleClickOutside);
		};
	  }, []);

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
		{user && <Button  position="fixed" left = '10px' onClick={() => navigate('/')}>Home</Button>}
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
			{user && <Spacer />}
			{user && (<Box position="relative" ref={searchResultsRef}>
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
			{user && (<Spacer />)}	
			{user && (
				<Flex alignItems={"center"}  gap={4}>
					<Link as={RouterLink} to={`/${user.username}`} color={'blackAlpha.900'}>
						<RxAvatar size={24} />
					</Link>
					{/* <Link as={RouterLink} to={`/chat`} color={'blackAlpha.900'}>
						<BsFillChatQuoteFill size={20} />
					</Link> */}
					<Link as={RouterLink} to={`/settings`} color={'blackAlpha.900'}>
						<MdOutlineSettings size={20} />
					</Link>
					<Button size={"xs"} onClick={logout} color={'blackAlpha.900'}>
						<FiLogOut size={20} />
					</Button>
				</Flex>
			)}

		</Flex>
	);
};

export default Header;
