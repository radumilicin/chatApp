'use client'
import Image from "next/image";
import Conversations from "./Conversations";
import CurrentChat from "./CurrentChat";
import OptionsBar from './Settings';
import { useEffect, useState, useRef } from 'react';
import ProfileSettings from "./ProfileSettings";
import ProfileInfo from "./InfoProfile";
import AddPersonToGroup from "./AddingToGroup";
import Login from "./pages/auth/login/page";
import Register from "./pages/auth/registration/page";
import {useAuth} from "./AuthProvider"


export default function Home() {

  const [user, setUser] = useState(-1);
  const [users, updateUsers] = useState([]);  // Change state to an array instead of object
  const [contacts, updateContacts] = useState([]);
  const [images, updateImages] = useState([]);
  const [pressed, setPressed] = useState(null) // this is the id of the user 
  const [curr_contact, setCurrContact] = useState(null)
  const [pressedProfile, setPressProfile] = useState(false)
  const [profileInfo, setProfileInfo] = useState(false)
  const [addingToGroup, setAddToGroup] = useState(false)
  const {loggedIn, registered, setLoggedIn, setRegistered} = useAuth()

  // this is when we are looking at AddContacts and we press on one to text
  const [potentialContact, setPotentialContact] = useState(null);
  const prevPotentialContact = useRef(null);

  useEffect(() => {
    if(loggedIn) {

    }
  }, [loggedIn])

  useEffect(() => {
    console.log("registered changed to = " + JSON.stringify(registered));
  }, [registered])
  
  let image_path = "./images/userProfile2.jpg"

  const setRegisteredAsync = async () => {
    setRegistered()
  }

  const fetchData = async () => {
      const response = await fetch('http://localhost:3002/users'); // Replace with your API endpoint
      const result = await response.json();
      updateUsers(result);
      console.log(result);
    };

  const fetchData2 = async () => {
      const response = await fetch(`http://localhost:3002/contacts?user=${user}`); // Replace with your API endpoint
      const result = await response.json();
      updateContacts(result);
      console.log("contacts = " + JSON.stringify(result));
    };

  const fetchImages = async () => {
      const response = await fetch(`http://localhost:3002/images`); // Replace with your API endpoint
      const result = await response.json();
      updateImages(result);
      console.log(result);
    };
  

  // gets the users
  useEffect(() => {

    // Function to fetch data

    console.log("Logged in = " + loggedIn + " registered = " + registered)

    fetchData()

    console.log("user = " + user)

    fetchData2()

    fetchImages()

    console.log(JSON.stringify(contacts))

    // console.log("images = " + images)
  }, []); // Empty dependency array ensures this effect runs only once (on mount)

  useEffect(() => {
    // console.log("images = " + JSON.stringify(images))
  }, [images])

  return (
    <div className="absolute left-0 top-0 w-full h-full">
      <div className={`relative left-0 top-0 w-full h-full flex flex-row bg-[#3B7E9B] ${addingToGroup === true ? 'blur-sm' : 'blur-none'}`}>
        {loggedIn === true && <div className="relative left-0 top-0 w-full h-full flex flex-row bg-[#3B7E9B]">
        
          <OptionsBar curr_user={user} users={users} images={images} setPressProfile={setPressProfile}></OptionsBar>
          {pressedProfile === false ? <Conversations users={users} contacts={contacts} images={images} setPressed={setPressed} curr_user={user} contact={curr_contact} setCurrContact={setCurrContact}
                                      fetchUsers={fetchData} fetchContacts={fetchData2} fetchImages={fetchImages} setLoggedIn={setLoggedIn} setPotentialContact={setPotentialContact}
          ></Conversations> 
                                    : <ProfileSettings users={users} curr_user={user} images={images} setPressProfile={setPressProfile} fetchData={fetchData} 
                                          fetchData2={fetchData2} fetchImages={fetchImages} addingToGroup={addingToGroup}></ProfileSettings>
          }
          {profileInfo === false ? <CurrentChat users={users} contacts={contacts} images={images} contact={curr_contact} curr_user={user} setProfileInfo={setProfileInfo} 
                                                addingToGroup={addingToGroup} potentialContact={potentialContact} prevPotentialContact={prevPotentialContact}></CurrentChat>
                                : <ProfileInfo setProfileInfo={setProfileInfo} contact={curr_contact} users={users} curr_user={user} contacts={contacts} images={images} fetchContacts={fetchData2} fetchUsers={fetchData} 
                                      fetchImages={fetchImages} setCurrContact={setCurrContact} setAddToGroup={setAddToGroup} addingToGroup={addingToGroup}></ProfileInfo>}
         
        </div>}
        {(registered === true && loggedIn === false) ? <Login users={users} setU={setUser} setRegisteredAsync={setRegisteredAsync}></Login> : (registered === false && loggedIn === false) ? <Register users={users} setRegisteredAsync={setRegisteredAsync}></Register> : <></>}
      </div>
      {profileInfo === true && curr_contact !== null && curr_contact.is_group === true && addingToGroup === true && <AddPersonToGroup contact={curr_contact} curr_user={user} contacts={contacts} users={users} fetchContacts={fetchData2} setAddToGroup={setAddToGroup} images={images}></AddPersonToGroup>}
    </div>
  );
}


