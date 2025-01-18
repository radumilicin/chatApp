'use client'

import Image from 'next/image'
import React, {useState, useEffect} from 'react';

export default function Conversations( props : any) {
    
    const [currentSearch, setCurrSearch] = useState('');
    const [filteredContacts, setFilteredContacts] = useState([]);

    useEffect(() => {
        if(props.contacts !== null) {
            filterContacts(currentSearch)
            console.log("filteredContacts = " + JSON.stringify(filteredContacts))
        }
    }, [props.contacts, currentSearch])

    function getUserWithId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user : {};
    }

    async function filterContacts(val : string) { 
        console.log("In filteredContacts .. ")     
        console.log("users = " + JSON.stringify(props.users) + " type users = " + typeof(props.users))     
        console.log("contacts = " + JSON.stringify(props.contacts))     
        setFilteredContacts(props.contacts.filter((contact) => {
            const user = props.users.find((user) => user.id === contact.contact_id);
            return user?.username.includes(val); // Safely access `username` using optional chaining
        }))
    }

    return (
        <div className="relative left-[8%] w-[30%] top-[10%] h-[80%] bg-[#7DD8C3] rounded-r-xl border-white border-2">
            {/* search bar here */}
            <SearchBar currentSearch={currentSearch} setCurrSearch={setCurrSearch} filterContacts={filterContacts}></SearchBar>
            <Contacts currentSearch={currentSearch} users={props.users} filteredContacts={filteredContacts} contacts={props.contacts} curr_user={props.curr_user} images={props.images} setPressed={props.setPressed} setCurrContact={props.setCurrContact}></Contacts>
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
                    <input className="absolute left-0 top-0 w-full h-full outline-none text-white bg-transparent overflow-x-auto text-xl" 
                        value={props.currentSearch}
                        onChange={async (e) => {props.setCurrSearch(e.target.value); props.filterContacts(e.target.value)}} // Update `currentSearch`
                    >
                    </input>
                </div>
            </div>
        </div>
    );
}

export function Contacts( props: any) {

    let curr_user = 1

    const isBase64 = value => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value);

    // here I need to have current user .. so then I can extract its contacts .. 
    // let's say for simplicity curr_user = 1
    // and here we extract its contacts and the messages that happen most recently are shown first

    function getNameWithUserId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user.username : "";
    }
     
    function getLastMessage(contact : any, idx: number) {
        let lenMsgs = contact.message.length
        let last_msg = contact.message[lenMsgs - 1]
        console.log(`this is the ${idx}th contact in the list with the message = ${last_msg.message}`)
        return last_msg
    }

    function getUnreadMessages(contact: any, idx: number) {
        let lenMsgs = contact.message.length
        let last_msg = contact.message[lenMsgs - 1]
        let cnt_unread = 0
        if(last_msg.recipient_id === curr_user) {
            for(let i = lenMsgs - 1; i > -1 ; i--){
                if(contact.message[i].recipient_id === curr_user) cnt_unread += 1
                else break
            }
        }
        return cnt_unread
    }

    function getImage(contact: any) {
        const image = props.images.find((image: any) => image.user_id === contact.contact_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    // type user is either current or other (0,1)
    function getProfileImage(contact: any, type_user : number) {
        const user = props.users.find((user) => {
            if(type_user === 0){
                return user.id === props.curr_user
            } else {
                return contact.contact_id === user.id
            }
        })
        const image = props.images.find((image: any) => image.id === user.image_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    return (
        <div className="absolute left-0 top-[16%] w-full h-[84%]">
            <div className="relative top-0 left-0 h-full w-full flex flex-col overflow-scroll">
                { props.filteredContacts !== null && props.filteredContacts.map((element: any, idx: number) => (
                    element.id === props.curr_user ?
                    <div
                        key={idx}
                        className={`relative h-[12%] w-full bg-slate-400 bg-opacity-50 flex flex-row border-y-gray-700 border-t-[1px]`}
                        onClick={() => {props.setPressed(element); props.setCurrContact(element); console.log("clicked")}}
                    >
                        <div className="flex w-[10%] justify-center items-center">
                            {/* Use base64 data for image */}
                            {getImage(element).data !== "" ? <img
                                src={`data:image/jpg;base64,${getImage(element).data}`}
                                className="h-[75%] w-[75%] rounded-full"
                                alt="Profile"
                            /> : getProfileImage(element, 1).data !== "" ? <img
                                src={`data:image/jpg;base64,${getImage(element).data}`}
                                className="h-[75%] w-[75%] rounded-full"
                                alt="Profile"></img> : 
                                <img src="./userProfile.jpg" className="h-[75%] w-[75%] rounded-full"></img>}
                        </div>
                        <div className="flex w-[90%] flex-col">
                            <div className="flex h-[50%] w-full items-center flex-row">
                                <div className="w-[80%] h-full">
                                    <div className="indent-[20px] text-xl font-medium font-sans">
                                        {getNameWithUserId(element)}
                                    </div>
                                </div>
                                <div className="w-[20%] h-full flex flex-row justify-center">
                                    <div className="rounded-full contain-size bg-green-700 justify-center bg-contain h-full">
                                        {element.message[0] !== null && element.message[0].recipient_id === curr_user && getUnreadMessages(element, idx)}
                                    </div> 
                                </div>
                            </div>
                            <div className="relative flex w-full h-[50%] items-center">
                                {/* Left text container */}
                                <div className="relative flex flex-row h-full w-[80%]">
                                    <div className="indent-[20px] flex h-full w-full items-center text-sm text-gray-600 font-medium">
                                        {(getLastMessage(element, idx).message).hasOwnProperty("image_id") ? "Image" : getLastMessage(element, idx).message}
                                    </div>
                                </div>
                                {/* Right time container */}
                                <div className="relative flex flex-row h-full w-[20%]">
                                    <div className="flex h-full w-full flex-row items-center text-sm text-gray-600 font-medium">
                                        {getLastMessage(element, idx).user_id === curr_user
                                            ? "Sent " + getLastMessage(element, idx).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                            : getLastMessage(element, idx).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                        }
                                    </div>

                                </div>
                        </div>
                        </div>
                    </div> : <></>))}
                { props.filteredContacts === null && props.contacts.map((element: any, idx: number) => (
                    element.id === props.curr_user ?
                    <div
                        key={idx}
                        className={`relative h-[12%] w-full bg-slate-400 bg-opacity-50 flex flex-row border-y-black border-2`}
                        onClick={() => {props.setPressed(element); props.setCurrContact(element); console.log("clicked")}}
                    >
                        <div className="flex w-[10%] justify-center items-center">
                            {/* Use base64 data for image */}
                            <img
                                src={`data:image/jpg;base64,${getImage(element).data}`}
                                className="h-[75%] w-[75%] rounded-full"
                                alt="Profile"
                            />
                        </div>
                        <div className="flex w-[90%] flex-col">
                            <div className="flex h-[50%] w-full items-center flex-row">
                                <div className="w-[80%] h-full">
                                    <div className="indent-[20px] text-xl font-medium font-sans">
                                        {getNameWithUserId(element)}
                                    </div>
                                </div>
                                <div className="w-[20%] h-full flex flex-row justify-center">
                                    <div className="rounded-full contain-size bg-green-700 justify-center bg-contain h-full">
                                        {element.message[0] !== null && element.message[0].recipient_id === curr_user && getUnreadMessages(element, idx)}
                                    </div> 
                                </div>
                            </div>
                            <div className="relative flex w-full h-[50%] items-center">
                                {/* Left text container */}
                                <div className="relative flex flex-row h-full w-[80%]">
                                    <div className="indent-[20px] flex h-full w-full items-center text-sm text-gray-600 font-medium">
                                        {getLastMessage(element, idx).message}
                                    </div>
                                </div>
                                {/* Right time container */}
                                <div className="relative flex flex-row h-full w-[20%]">
                                    <div className="flex h-full w-full flex-row items-center text-sm text-gray-600 font-medium">
                                        {getLastMessage(element, idx).user_id === curr_user
                                            ? "Sent " + getLastMessage(element, idx).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                            : getLastMessage(element, idx).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                        }
                                    </div>

                                </div>
                        </div>
                        </div>
                    </div> : <></>
                ))}
            </div>
        </div>
    );
}