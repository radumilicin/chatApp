'use client'
import Image from "next/image";
import Conversations from "./Conversations";
import CurrentChat from "./CurrentChat";
import OptionsBar from './Settings';
import { useEffect, useState } from 'react';
import ProfileSettings from "./ProfileSettings";


export default function Home() {

  const [users, updateUsers] = useState([]);  // Change state to an array instead of object
  const [contacts, updateContacts] = useState([]);
  const [images, updateImages] = useState([]);
  const [pressed, setPressed] = useState(null) // this is the id of the user 
  const [curr_contact, setCurrContact] = useState(null)
  const [pressedProfile, setPressProfile] = useState(false)

  // change this when authentication will be a thing 
  let user = 1
  let image_path = "./images/userProfile2.jpg"

  // gets the users
  useEffect(() => {

    // Function to fetch data
    const fetchData = async () => {
      const response = await fetch('http://localhost:3002/users'); // Replace with your API endpoint
      const result = await response.json();
      updateUsers(result);
      console.log(result);
    };

    fetchData()

    console.log("user = " + user)
    
    const fetchData2 = async () => {
      const response = await fetch(`http://localhost:3002/contacts?user=${user}`); // Replace with your API endpoint
      const result = await response.json();
      updateContacts(result);
      console.log(result);
    };

    fetchData2()

    const fetchImages = async () => {
      const response = await fetch(`http://localhost:3002/images`); // Replace with your API endpoint
      const result = await response.json();
      updateImages(result);
      console.log(result);
    };

    fetchImages()

    console.log(JSON.stringify(contacts))

    // console.log("images = " + images)
  }, []); // Empty dependency array ensures this effect runs only once (on mount)

  useEffect(() => {
    // console.log("images = " + JSON.stringify(images))
  }, [images])

  return (
    <div className="absolute left-0 top-0 w-full h-full bg-[#3B7E9B]">
      <div className="relative left-0 top-0 w-full h-full flex flex-row">
        <OptionsBar curr_user={user} users={users} images={images} setPressProfile={setPressProfile}></OptionsBar>
        {pressedProfile === false ? <Conversations users={users} contacts={contacts} images={images} setPressed={setPressed} curr_user={user} contact={curr_contact} setCurrContact={setCurrContact}></Conversations> 
                                  : <ProfileSettings users={users} curr_user={user} images={images} setPressProfile={setPressProfile}></ProfileSettings>
        
        }
        <CurrentChat users={users} contacts={contacts} images={images} contact={curr_contact} curr_user={user}></CurrentChat>
      </div>
    </div>
  );
}


