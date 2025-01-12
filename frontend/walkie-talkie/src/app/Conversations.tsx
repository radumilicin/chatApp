'use client'

import Image from 'next/image'
import React, {useState} from 'react';

export default function Conversations( props : any) {
    
    const [currentSearch, setCurrSearch] = useState('');

    function getUserWithId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user : {};
    }

    return (
        <div className="relative left-[5%] w-[30%] top-[10%] h-[80%] bg-[#7DD8C3] rounded-2xl border-white border-2">
            {/* search bar here */}
            <SearchBar currentSearch={currentSearch} setCurrSearch={setCurrSearch}></SearchBar>
            <Contacts currentSearch={currentSearch} users={props.users} contacts={props.contacts} images={props.images} setPressed={props.setPressed} setCurrContact={props.setCurrContact}></Contacts>
        </div>
    );
}

export function SearchBar( props : any ) {

    return (
        <div className="absolute left-[2%] top-[2%] w-[96%] h-[10%] rounded-2xl border-white border-2 bg-gray-500 bg-opacity-50">
            <div className="relative top-0 left-0 h-full w-full flex flex-row">
                <div className='relative left-0 top-0 w-[10%] h-full flex flex-col justify-center items-center'>
                    <img className='absolute max-w-[50px] max-h-[50px] w-[50%] h-[50%]' src="/search.png"></img>
                </div>
                <div className='relative left-[2%] top-0 w-[86%] h-full flex flex-col justify-center items-start indent-2'>
                    <input className="absolute left-0 top-0 w-full h-full outline-none text-white bg-transparent overflow-x-auto" 
                        value={props.currentSearch}
                        onChange={(e) => props.setCurrSearch(e.target.value)} // Update `currentSearch`
                    >
                    </input>
                </div>
            </div>
        </div>
    );
}

export function Contacts( props: any) {

    let curr_user = 1

    // here I need to have current user .. so then I can extract its contacts .. 
    // let's say for simplicity curr_user = 1
    // and here we extract its contacts and the messages that happen most recently are shown first

    function getNameWithUserId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user.username : "";
    }
     
    function getLastMessage(contact : any) {
        let msgs = contact.message
        if(msgs === "{}") return ""
        else return ""
        // else {
        //     return contact.message["messages"][contact.message["messages"].length() - 1]
        // }
    }

    function getImage(contact: any) {
        const image = props.images.find((image: any) => image.user_id === contact.contact_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    return (
        <div className="absolute left-0 top-[16%] w-full h-[84%]">
            <div className="relative top-0 left-0 h-full w-full flex flex-col">
                {props.contacts.map((element: any, idx: number) => (
                    <div
                        key={idx}
                        className={`relative h-[12%] w-full bg-slate-400 bg-opacity-50 flex flex-row border-y-black border-2`}
                        onClick={() => {props.setPressed(element); props.setCurrContact(element);}}
                    >
                        <div className="flex w-[10%] justify-center items-center">
                            {/* Use base64 data for image */}
                            <img
                                src={`data:image/jpg;base64,${getImage(element).data}`}
                                className="h-[75%] w-[75%] rounded-full"
                                alt="Profile"
                            />
                        </div>
                        <div className="flex basis-[9/10]">
                            <div className="flex h-[50%] w-full items-center">
                                <div className="indent-[20px]">{getNameWithUserId(element)}</div>
                            </div>
                            <div className="flex h-[50%] w-full items-center">
                                {getLastMessage(element)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}