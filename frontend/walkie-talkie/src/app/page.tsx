'use client'
import Image from "next/image";
import Conversations from "./Conversations";
import CurrentChat from "./CurrentChat";
import { useEffect, useState } from 'react';


export default function Home() {

  const [users, updateUsers] = useState([]);  // Change state to an array instead of object
  const [contacts, updateContacts] = useState([]);

  // change this when authentication will be a thing 
  let user = 1

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
  }, []); // Empty dependency array ensures this effect runs only once (on mount)

  return (
    <div className="absolute left-0 top-0 w-full h-full bg-[#3B7E9B]">
      <div className="relative left-0 top-0 w-full h-full flex flex-row">
        <Conversations users={users} contacts={contacts}></Conversations>
        <CurrentChat users={users} contacts={contacts}></CurrentChat>
      </div>
    </div>
  );
}


