'use client'
import Image from "next/image";
import Conversations from "./Conversations";
import CurrentChat from "./CurrentChat";
import { useEffect, useState } from 'react';


export default function Home() {

  const [users, updateUsers] = useState([]);  // Change state to an array instead of object

  useEffect(() => {
  }, []); // Empty dependency array ensures this effect runs only once (on mount)

  return (
    <div className="absolute left-0 top-0 w-full h-full bg-[#3B7E9B]">
      <div className="relative left-0 top-0 w-full h-full flex flex-row">
        <Conversations ></Conversations>
        <CurrentChat></CurrentChat>
      </div>
    </div>
  );
}


