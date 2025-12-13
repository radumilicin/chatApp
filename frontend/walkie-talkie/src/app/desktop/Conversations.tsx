'use client'

import Image from 'next/image'
import React, {useState, useEffect, useRef, useCallback} from 'react';
import { GrFormNextLink } from "react-icons/gr";
import { Theme } from './AppearanceSettings';

export default function Conversations( props : any) {
    
    const [currentSearch, setCurrSearch] = useState('');
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [filteredDecryptedContacts, setFilteredDecryptedContacts] = useState([]);
    const [menuPress, setMenuPress] = useState(false)
    const [newChatPress, setNewChatPress] = useState(false)
    const [newGroupPress, setNewGroupPress] = useState(false)
    const [logOut, setLogOut] = useState(false)
    const [pressed2, setPressed2] = useState(false) // this is for selecting contacts for groups
    const [contactsInNewGroup, setContactsInNewGroup] = useState([])
    const [addContact, setAddContact] = useState(false) // adding contact

    /* This is for adding users to contacts IF IN the ADD CONTACT mode */
    const [filteredUsers, setFilteredUsers] = useState([])
    const [potentialContact, setPotentialContact] = useState(null);

    useEffect(() => {
        if(props.contacts !== null) {
            filterContacts(currentSearch)
            // console.log("filteredContacts = " + JSON.stringify(filteredContacts))
        }
        
    }, [props.contacts, currentSearch])
    
    useEffect(() => { 
        console.log(`decrypted contacts in conversations: ${JSON.stringify(props.decryptedContacts)}`)
        if(props.decryptedContacts !== null) {
            console.log(`decrypted contacts in conversations: ${JSON.stringify(props.decryptedContacts)}`)
            filterDecryptedContacts(currentSearch)
            // console.log("filteredContacts = " + JSON.stringify(filteredContacts))
        }

    }, [props.decryptedContacts, currentSearch])

    useEffect(() => {
        if(logOut === true) {
            console.log("LOGOUT === TRUE???")
            props.setLoggedIn(false)
            logOutNow()
        }
    }, [logOut])

    useEffect(() => {
        if(props.settingsPressed === true || props.pressedProfile === true) {
            setNewGroupPress(false)
            setNewChatPress(false)
            setAddContact(false)
        }
    }, [props.settingsPressed, props.pressedProfile])

    async function logOutNow() {

        try {
            const res = await fetch(`http://localhost:3002/logout`, {
                method: 'GET',
                credentials: "include",
            });
            
            if(res.ok) {
                props.updateUsers([]);
                props.updateContacts([]);
                props.updateImages([]);
                props.setUser("");
            }

        } catch (err) {
            console.error(JSON.stringify(err))
        }
    }

    function getUserWithId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user : {};
    }

    async function filterContacts(val : string) { 
        console.log("In filteredContacts .. ")     
        // console.log("users = " + JSON.stringify(props.users) + " type users = " + typeof(props.users))     
        // console.log("contacts = " + JSON.stringify(props.contacts))   
        
        const filteredContactsUnordered = props.contacts.filter((contact) => {
            if(contact.is_group === false) {
                // Find the OTHER user in the contact (not the current user)
                const otherUserId = contact.sender_id === props.curr_user 
                    ? contact.contact_id 
                    : contact.sender_id;
            
                const user = props.users.find((user) => user.id === otherUserId);
            
                return user?.username.includes(val); // Safely access `username` using optional chaining
            } else {
                return contact.group_name.includes(val);
            }
        });

        /* GET id and timestamp of all contacts and sort based on descending timestamp */ 
        /* Sort contacts based on the timestamp of the last message (descending - most recent first) */
        const filteredContactsOrderedByTimestamp = filteredContactsUnordered.sort((a, b) => {
            // Get the last message timestamp for contact a
            const lastMessageA = a.message && a.message.length > 0 
                ? new Date(a.message[a.message.length - 1].timestamp).getTime()
                : 0; // If no messages, use 0 (will be sorted to the end)
            
            // Get the last message timestamp for contact b
            const lastMessageB = b.message && b.message.length > 0 
                ? new Date(b.message[b.message.length - 1].timestamp).getTime()
                : 0; // If no messages, use 0 (will be sorted to the end)
            
            // Sort in descending order (most recent first)
            return lastMessageB - lastMessageA;
        });

        setFilteredContacts(filteredContactsOrderedByTimestamp)
    }

    function filterDecryptedContacts(val : string) { 
        console.log(`In filteredContacts with decrypted contacts = ${props.decryptedContacts}`)     
        // console.log("users = " + JSON.stringify(props.users) + " type users = " + typeof(props.users))     
        // console.log("contacts = " + JSON.stringify(props.contacts))  
        
        const filteredContactsUnordered = props.decryptedContacts.filter((contact) => {
            if(contact.is_group === false) {
                // Find the OTHER user in the contact (not the current user)
                const otherUserId = contact.sender_id === props.curr_user 
                    ? contact.contact_id 
                    : contact.sender_id;
            
                const user = props.users.find((user) => user.id === otherUserId);
            
                return user?.username.includes(val); // Safely access `username` using optional chaining
            } else {
                return contact.group_name.includes(val);
            }
        });

        /* GET id and timestamp of all contacts and sort based on descending timestamp */ 
        /* Sort contacts based on the timestamp of the last message (descending - most recent first) */
        const filteredContactsOrderedByTimestamp = filteredContactsUnordered.sort((a, b) => {
            // Get the last message timestamp for contact a
            const lastMessageA = a.message && a.message.length > 0 
                ? new Date(a.message[a.message.length - 1].timestamp).getTime()
                : 0; // If no messages, use 0 (will be sorted to the end)
            
            // Get the last message timestamp for contact b
            const lastMessageB = b.message && b.message.length > 0 
                ? new Date(b.message[b.message.length - 1].timestamp).getTime()
                : 0; // If no messages, use 0 (will be sorted to the end)
            
            // Sort in descending order (most recent first)
            return lastMessageB - lastMessageA;
        });

        setFilteredDecryptedContacts(filteredContactsOrderedByTimestamp)
    }

    // function for adding contacts
    async function filterUsers(val: string) {
        const users_matching_filter = props.users.filter(
            usr => usr.username.includes(val) && usr.id !== props.curr_user
        );

        console.log("users matching filter:", users_matching_filter);

        const not_in_contacts = users_matching_filter.filter(user => {
            const isInContacts = props.contacts.find(contact => {
            return (
                (props.curr_user === contact.sender_id && user.id === contact.contact_id) ||
                (props.curr_user === contact.contact_id && user.id === contact.sender_id)
            )});

            return isInContacts === undefined; // ✅ was `null`
        });

        console.log("not in contacts matching filter:", not_in_contacts);

        setFilteredUsers(not_in_contacts);
        // return not_in_contacts;
    }

    async function removeContactFromGroup(contact) {
        setContactsInNewGroup(contactsInNewGroup.filter((elem) => ( contact.id !== elem.id )))

    }

    const handleOutsideClick = useCallback((value) => {
        setMenuPress(value);
    }, []);

    return (
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-[#323232] bg-opacity-60 border-[#0D1317] " : "bg-gray-300 border-gray-400 shadow-lg border-2"}`}>
            {newGroupPress && <Groups setNewGroupPress={setNewGroupPress} contactsInNewGroup={contactsInNewGroup} users={props.users} contacts={props.contacts}
                removeContactFromGroup={removeContactFromGroup} setContactsInNewGroup={setContactsInNewGroup} curr_user={props.curr_user} setAddContact={setAddContact} 
                fetchUsers={props.fetchUsers} fetchContacts={props.fetchContacts} fetchImages={props.fetchImages} images={props.images} themeChosen={props.themeChosen}></Groups>}
            {!newGroupPress && <OtherOptions setMenuPress={setMenuPress} setNewChatPress={setNewChatPress} addContact={addContact} setAddContact={setAddContact} setAddContact2={props.setAddContact2} themeChosen={props.themeChosen}></OtherOptions>}
            {!newGroupPress && <MenuDropdown menuPress={menuPress} setMenuPress={setMenuPress} onOutsideClick={handleOutsideClick} setNewGroupPress={setNewGroupPress} setLogOut={setLogOut} 
                                             setAddContact={setAddContact} setAddContact2={props.setAddContact2} themeChosen={props.themeChosen}></MenuDropdown>}
            {!newGroupPress && <SearchBar currentSearch={currentSearch} setCurrSearch={setCurrSearch} filterContacts={filterContacts} filterUsers={filterUsers} addContact={addContact} themeChosen={props.themeChosen}></SearchBar>}
            {!newGroupPress && !addContact && <Contacts currentSearch={currentSearch} users={props.users} filteredContacts={filteredContacts} filteredDecryptedContacts={filteredDecryptedContacts} filteredUsers={filteredUsers} contacts={props.contacts} curr_user={props.curr_user} images={props.images} 
                                                        setPressed={props.setPressed} setCurrContact={props.setCurrContact} contact={props.contact} closeChat={props.closeChat} fetchContacts={props.fetchContacts} themeChosen={props.themeChosen}></Contacts>}
            {!newGroupPress && addContact && <UsersToAddToContacts themeChosen={props.themeChosen} currentSearch={currentSearch} users={props.users} addContact={addContact} filteredContacts={filteredContacts}
                                        filteredUsers={filteredUsers} filterUsers={filterUsers} contacts={props.contacts} curr_user={props.curr_user} images={props.images} setPressed={props.setPressed} setPotentialContact={props.setPotentialContact} setCurrContact={props.setCurrContact} setAddContact={setAddContact}></UsersToAddToContacts>}
        </div>
    );
}

export function MenuDropdown (props) {

    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Event listener for clicks
        const handleClickOutside = (event) => {
            console.log("divRef.current:", divRef.current);
            console.log("event.target:", event.target);
            if (divRef.current && !divRef.current.contains(event.target)) {
                props.onOutsideClick(false) // set menu press to false
                console.log("outside press")
            }
            console.log("HERE")
        };

        // listens if the whole document was clicked and if it is then see if it was then
        // check if the click happened outside
        // Attach event listener to the document
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup function to remove the listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [props.onOutsideClick]);

    return (
    (props.menuPress && <div ref={divRef} className={`absolute left-[62%] top-[6%] w-[36%] h-[10%] flex flex-col rounded-md ${props.themeChosen === "Dark" ? "bg-gray-600" : "bg-gray-300 border-[1px] border-gray-600"} z-10`} onMouseDown={(e) => {e.stopPropagation()}}>
            <div className={`relative flex flex-row justify-center items-center left-0 w-full rounded-t-md h-[50%] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-xs lg:text-sm xl:text-base hover:bg-slate-400 hover:bg-opacity-40`} onClick={(e) => {
                e.stopPropagation()
                e.preventDefault();
                props.setNewGroupPress(true); 
                console.log("In new group div?")
                setTimeout(() => props.setMenuPress(false), 0);}}>New Group</div>
            <div className={`relative flex flex-row justify-center items-center left-0 w-full h-[50%] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-xs lg:text-sm xl:text-base hover:bg-slate-400 hover:bg-opacity-40`} onClick={(e) => {
                e.stopPropagation()
                e.preventDefault();
                props.setAddContact(true); 
                props.setAddContact2(true); 
                console.log("In new contact div?")
                setTimeout(() => props.setMenuPress(false), 0);}}>New Contact</div>
            <div className={`relative flex flex-row justify-center items-center left-0 w-full rounded-b-md h-[50%] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-xs lg:text-sm xl:text-base hover:bg-slate-400 hover:bg-opacity-40`} onClick={(e) => {
                e.stopPropagation()
                e.preventDefault();
                props.setLogOut(true); 
                setTimeout(() => props.setMenuPress(false), 0);
                console.log("In logout div?")
                }}>Log out</div>
        </div>)
    );
}

export function OtherOptions (props) {
    return (
        <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
            {props.addContact && <div className={`relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-gray-500 ${props.themeChosen === "Dark" ? "bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl hover:cursor-pointer`} onClick={() => {props.setAddContact(false); props.setAddContact2(false);}}>
                    <img src={`${props.themeChosen === "Dark" ? "/back-arrow.png" : "back_image_black.png"}`} className="justify-center items-center w-6 h-6"></img>
                </div>} 
            {props.addContact && <div className={`relative indent-[20px] left-[2%] w-[40%] text-base xl:text-xl font-semibold ${props.themeChosen === "Dark" ? "text-slate-200" : "text-black"} font-sans flex flex-row justify-start items-center`}>Add contact</div>}
            {!props.addContact && <div className={`relative indent-[20px] left-[2%] w-[48%] text-xl xl:text-2xl font-semibold ${props.themeChosen === "Dark" ? "text-slate-200" : "text-black"} font-sans flex flex-row justify-start items-center`}>Chats</div>}
            <div className="relative left-[30%] w-[20%] h-full flex flex-row items-center">
                <div className={`relative left-0 w-[50%] h-full hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl flex flex-row items-center justify-center hover:cursor-pointer`} onClick={() => {props.setAddContact(true); props.setAddContact2(true); props.setMenuPress(false);}}>
                    <img src={`${props.themeChosen === "Dark" ? "/add-contact-3.png" : "add-contact-black.png"}`} className="justify-end items-center max-h-[100%] max-w-[100%]"></img>
                </div>
                <div className={`relative left-0 w-[50%] h-full hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl flex flex-row items-center justify-center hover:cursor-pointer`} onClick={() => {props.setMenuPress(true)}}>
                    <img src={`${props.themeChosen === "Dark" ? "menu-icon-white.png" : "menu-icon-black.png"}`} className={`justify-end items-center ${props.themeChosen === "Dark" ? "w-6 h-6" : "w-6 h-6"}`}></img>
                </div>
            </div>
        </div>
    ); 
}

export function SearchBar( props : any ) {

    return (
        <div className={`absolute left-[2%] top-[7%] w-[96%] h-[7%] rounded-2xl border-2 ${props.themeChosen === "Dark" ? "bg-[#0D1317] border-[#57CC99]" : "bg-gray-500 bg-opacity-60 border-gray-500" } `}>
            <div className="relative top-0 left-0 h-full w-full flex flex-row">
                <div className='relative left-0 top-0 w-[15%] h-full flex flex-col justify-center items-center'>
                    <img className='absolute max-w-[50px] max-h-[50px] w-[60%] h-[60%]' src="/searchIcon2-1.png"></img>
                </div>
                <div className='relative left-[2%] top-0 w-[86%] h-full flex flex-col justify-center items-start indent-2'>
                    <input className={`absolute left-0 top-0 w-full h-full outline-none ${props.themeChosen === "Dark" ? "text-white" : "text-black"} bg-transparent overflow-x-auto text-base lg:text-lg xl:text-xl`} 
                        value={props.currentSearch}
                        // placeholder='Add a contact..' // replace later
                        onChange={async (e) => {props.setCurrSearch(e.target.value); 
                                                if(props.addContact) {
                                                    console.log("Filtering users in Search")
                                                    props.filterUsers(e.target.value)
                                                }
                                                else {
                                                    props.filterContacts(e.target.value)
                                                }}} // Update `currentSearch`
                    >
                    </input>
                </div>
            </div>
        </div>
    );
}

export function UsersToAddToContacts (props : any) {
    
    let [curr_user, setCurrUser] = useState(-1);

    useEffect(() => {
        setCurrUser(props.curr_user);

        props.filterUsers("")

    }, [])

    useEffect(() => {
        if(props.addContact) {
            console.log("In Add Contacts")
        }
    }, [props.addContact])

    useEffect(() => {
        if(props.filteredUsers) {
            console.log("In Add Contacts, filteredUsers = " + JSON.stringify(props.filteredUsers))
        }
    }, [props.filteredUsers])

    
    const isBase64 = value => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value);

    function getNameWithUserId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user.username : "";
    }
    
    function getNameUser(usr: any) {
        const user = props.users.find((user) => user.id === usr.contact_id);
        return user ? user.username : "";
    }
    
    function getNameUser2(usr: any) {
        if(usr !== null) {
            return usr.username;
        } 
        
        return ""
    }


    
    function getImage(contact: any) {
        const image = props.images.find((image: any) => image.user_id === contact.contact_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    function getImageUser(user: any) {
        const image = props.images.find((image: any) => image.user_id === user.id)
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

   async function makeTemporaryContact(user: any) {
        let body = {
            "sender_id": curr_user,
            "contact_id": user.id
        }

        const response = await fetch(
            `http://localhost:3002/insertContact`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {
            console.error("Bad request");
            // return null;
        }

        const data = await response.json();

        var row = null;
        if (data?.data) {
            console.log("Inserted contact:", data.data);
            row = data.data; // This is the inserted contact row
        }

        props.setPotentialContact(row);
        props.setCurrContact(row);
        // props.setAddContact(false);
        props.filterUsers(props.currentSearch)
        // return null;
    }

    return ( 
        <div className="absolute left-0 top-[16%] w-full h-[84%]">
            <div className="relative top-0 left-0 h-full w-full flex flex-col overflow-scroll">
                { props.filteredUsers !== null && props.filteredUsers.map((element: any, idx: number) => (
                    // this is the normal conversation (1 on 1)
                    <div
                        key={idx}
                        className={`relative flex-none left-[2%] flex flex-row h-[12%] w-[96%] text-white bg-transparent hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} rounded-2xl mt-2 hover:cursor-pointer`}
                        onClick={async () => { await makeTemporaryContact(element); console.log("clicked")}}
                    >
                        <div className="relative flex w-[15%] h-full justify-center items-center">
                            {/* Use base64 data for image */}
                            {getImageUser(element).data !== "" ? <img
                                src={`data:image/jpg;base64,${getImageUser(element).data}`}
                                className="h-10 w-10 rounded-full"
                                alt="Profile"
                            /> : getImageUser(element).data !== "" ? <img
                                src={`data:image/jpg;base64,${getImageUser(element).data}`}
                                className="h-10 w-10 rounded-full"
                                alt="Profile"></img> : 
                                <img src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "userProfile2.png"}`} className="h-10 w-10 rounded-full"></img>}
                        </div>
                        <div className="relative flex w-[85%] flex-col">
                            <div className="relative flex flex-row h-[50%] w-full items-center">
                                <div className="w-[75%] h-full flex flex-row items-end">
                                    <div className={`indent-[10px] text-base xl:text-lg font-medium font-sans ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800" }`}>
                                        {getNameUser2(element)}
                                    </div>
                                </div>
                                <div className="w-[25%] h-full flex flex-row justify-center items-end">
                                    <div className="rounded-full contain-size text-2xl bg-green-700 justify-center bg-contain h-full">
                                    </div> 
                                </div>
                            </div>
                            <div className="relative flex w-full h-[50%] items-center">
                                {/* Left text container */}
                                <div className="relative flex flex-row h-full w-[75%] items-start">
                                    <div className={`indent-[10px] flex flex-row h-full w-full items-start text-[11px] lg:text-xs xl:text-sm ${props.themeChosen === "Dark" ? "text-gray-300" : "text-black"} font-medium truncate`}>
                                        {element.about}
                                    </div>
                                </div>
                                {/* Right time container */}
                                <div className="relative flex flex-row h-full w-[20%]">
                                    <div className="flex h-full w-full flex-row items-center justify-center text-lg text-gray-300 font-medium">
                                        
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>))}
                </div>
            </div>
    );

}

export function Contacts( props: any) {

    let [curr_user, setCurrUser] = useState(-1);

    useEffect(() => {
        if(props.curr_user != -1) setCurrUser(curr_user);
    }, [props.curr_user])

    const isBase64 = value => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value);

    const groupRef = useRef(null);
    const prevContact = useRef(null);

    // here I need to have current user .. so then I can extract its contacts .. 
    // let's say for simplicity curr_user = 1
    // and here we extract its contacts and the messages that happen most recently are shown first

    function getNameWithUserId(contact: any) {
        const user = props.users.find((user) => (user.id === contact.contact_id && contact.sender_id === props.curr_user) || 
                                                (user.id === contact.sender_id && contact.contact_id === props.curr_user));
        return user ? user.username : "";
    }
     
    function getLastMessage(contact : any, idx: number) {
        if(contact === null || contact === undefined) return {}

        let lenMsgs = contact.message.length
        if(contact.message.length === 0) return {"message" : "", "timestamp": "T     .", "curr_user": contact.sender_id, "recipient_id": contact.recipient_id}
        let last_msg = contact.message[lenMsgs - 1]

        if(!last_msg) {
            console.log(`last message doesn't exist... printing contact: ${JSON.stringify(last_msg)}`)
            return {}
        }

        console.log(`this is the ${idx}th contact in the list with the message = ${last_msg.message}`)
        return last_msg
    }

    function getNrUnreadMessages(contact: any, idx: number) {
        let lenMsgs = contact.message.length
        if(contact.message.length === 0) return 0
        let last_msg = contact.message[lenMsgs - 1]
        let cnt_unread = 0
        if(last_msg.recipient_id === curr_user) {
            for(let i = lenMsgs - 1; i > -1 ; i--){
                if(contact.message[i].sender_id !== curr_user) cnt_unread += 1
                else break
            }
        }
        return cnt_unread
    }

    function getUnreadMessages(contact: any) {
        if(!props.curr_user || !contact || !contact.closed_at) return 0;

        // let msgs = contact.message.length

        let closed_curr_user = contact.closed_at.find((elem) => elem.id === props.curr_user)
        let opened_curr_user = contact.opened_at.find((elem) => elem.id === props.curr_user)
        if(!closed_curr_user) return 0;
        // console.log()t

        // console.log("opened curr user: " + JSON.stringify(opened_curr_user) + ", contact = " + JSON.stringify(contact.id))
        // console.log("closed curr user: " + JSON.stringify(closed_curr_user) + ", contact = " + JSON.stringify(contact.id))
        // console.log("last message time: " + JSON.stringify(contact.message[contact.message.length - 1].timestamp) + ", contact = " + JSON.stringify(contact.id))

        let nr_unread_messages = 0

        if(!contact || !contact.message) return 0

        for(let i = contact.message.length - 1; i >= 0; i--) {
            if(contact.message[i] && contact.message[i].sender_id !== props.curr_user && ((Date.parse(contact.message[i].timestamp) > Date.parse(closed_curr_user.closed_at)) && 
                                                                   (Date.parse(contact.message[i].timestamp) > Date.parse(opened_curr_user.opened_at)))) {
                nr_unread_messages += 1
            }
        }

        return nr_unread_messages
    }

    function getImage(contact: any) {
        const image = props.images.find((image: any) => (image.user_id === contact.contact_id && contact.sender_id === props.curr_user) ||
                                                        (image.user_id === contact.sender_id && contact.contact_id === props.curr_user)
                                       );
        return image || { data: "" }; // Ensure we return a fallback value
    }
    
    function getImageGroup(contact: any) {
        const image = props.images.find((image: any) => image.id === contact.group_pic_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    function getLenMembers(contact) {
        console.log("members length = " + contact.members.length)
        return contact.members.length
    }

    function getLastMessageGroup(contact: any){
        const message = contact.message
        if(message.length === 0) return {}
        return message[message.length - 1]
    }

    useEffect(() => {
       // console.log("contacts in conversations = " + JSON.stringify(props.filteredContacts))
    }, [props.filteredContacts])

    useEffect(() => {
       console.log("decrypted contacts in conversations = " + JSON.stringify(props.filteredDecryptedContacts))
    }, [props.filteredDecryptedContacts])


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

    function calcDayDifference(currDate: string, cmpDate: string) {
        let curr : any = new Date(currDate)
        let cmpD : any = new Date(cmpDate)
        let timeDifference = curr - cmpD;
        return timeDifference / (1000 * 3600 * 24);
    }

    async function updateAccessedOnChat(timestamp : string) {

        let body = {
            "curr_user": props.curr_user,
            "contact": props.contact,
            "accessed_at": timestamp
        }

        console.log(`accessed chat with curr_user: ${props.curr_user}, contact: ${props.contact}, accessed_at: ${timestamp}`)

        try {
            const response = await fetch(`http://localhost:3002/accessedChat`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if(response.ok) {
                props.fetchContacts()
                if(prevContact !== null) props.closeChat(prevContact.current)
                console.log("updated accessedChat")
            } else {
                console.log()
            }
        } catch(err) {
            console.log("Error in changing time of access:" + err)
        }
    }

    function getDateTimestamp(val: string) {
        let date = val;
        let currDate = new Date().toISOString();

        let diff = calcDayDifference(currDate, date);
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        let cmpDate = new Date(date);
        if(diff == 0) {
            return val.split("T")[1].split(".")[0]
        } else if(diff < 7) {
            return dayNames[cmpDate.getDay()];
        } else {
            const day = String(cmpDate.getDate()).padStart(2, '0');
            const month = String(cmpDate.getMonth() + 1).padStart(2, '0');
            const year = cmpDate.getFullYear();
            return `${day}.${month}.${year}`;
        }

    }

    useEffect(() => {

        if(props.contact) {
            console.log("================\n\n\n CONTACT = " + JSON.stringify(props.contact) + "\n\n\n=================")
        }
    }, [props.contact])

    useEffect(() => {
    }, [props.filteredContacts])
    
    console.log("Initial rendering")


    return (
        <div className={`absolute left-0 top-[16%] w-full h-[84%]`}>
            <div className="relative top-0 left-0 h-full w-full flex flex-col items-center overflow-y-auto">
                { props.filteredDecryptedContacts !== null && props.filteredDecryptedContacts.map((element: any, idx: number) => {
                    
                    const lastMessage = getLastMessage(element, idx);
                    const time = lastMessage && lastMessage.timestamp
                    ? lastMessage.timestamp.split("T")[1].split(".")[0].slice(0, 5)
                    : "";
                    const isSender = lastMessage && lastMessage.sender_id === props.curr_user;

                    return (
                    // this is the normal conversation (1 on 1)
                    ((element.sender_id !== null && element.sender_id === props.curr_user) || (element.contact_id !== null && element.contact_id === props.curr_user)) ? 
                    <div
                        key={idx}
                        className={`relative flex-none flex flex-row h-[12%] w-[96%] text-[#FFD166] bg-transparent hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} rounded-2xl mt-2 hover:cursor-pointer`}
                       onClick={(e) => {
                        //  e.stopPropagation();
                        console.log("==============\nFIRST DIV PRESSED\n================")
                        console.log("CLICKED BY USER?", e.isTrusted);
                        if(!e.isTrusted) {
                            console.log("Synthetic click: ignore")
                            return
                        }

                        props.setPressed(element); 

                        let contact = {...element};
                        let timestamp = new Date().toISOString()
                        for(let i = 0 ; i < contact.opened_at.length; i++) {
                            if(contact.opened_at[i].id === props.curr_user) contact.opened_at[i].opened_at = timestamp;
                        }

                        props.setCurrContact(contact); 
                        // props.setCurrContact(element); 
                        // console.log("clicked")
                    }}  // <--- Only TWO closing braces needed 
                    >
                        <div className="relative flex w-[15%] h-full justify-center items-center">
                            {/* Use base64 data for image */}
                            {getImage(element).data !== "" ? <img
                                src={`data:image/jpg;base64,${getImage(element).data}`}
                                className="h-10 w-10 rounded-full"
                                alt="Profile"
                            /> : getProfileImage(element, 1).data !== "" ? <img
                                src={`data:image/jpg;base64,${getImage(element).data}`}
                                className="h-10 w-10 rounded-full"
                                alt="Profile"></img> : 
                                <img src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "./userProfile2.png"}`} className="h-10 w-10 rounded-full"></img>}
                        </div>
                        <div className="relative flex flex-col w-[85%]">
                            <div className="relative flex flex-row h-[50%] w-full items-center">
                                <div className="w-[75%] h-full flex flex-row items-end">
                                    <div className={`indent-[10px] text-base lg:text-lg xl:text-xl font-medium font-sans ${props.themeChosen === "Dark" ? "text-gray-300" : "text-black" } `}>
                                        {getNameWithUserId(element)}
                                    </div>
                                </div>
                                <div className="w-[25%] h-full flex flex-row justify-center items-end">
                                    <div className={`flex flex-row justify-center items-center rounded-full contain-size text-xs lg:text-sm xl:text-base ${getUnreadMessages(element) > 0 ? 'bg-green-700' : ''} ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} bg-contain h-[60%] w-[40%] text-white hover:cursor-pointer`}>
                                        {getUnreadMessages(element) > 0 ? getUnreadMessages(element) : ''}
                                    </div> 
                                </div>
                            </div>
                            <div className="relative flex flex-row w-full h-[50%]">
                                {/* Left text container */}
                                <div className="relative flex flex-row h-full w-[75%] items-start">
                                    <div className={`indent-[10px] flex flex-row h-full w-full items-start text-xs lg:text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-800"} font-medium overflow-x-hidden`}>
                                        {lastMessage.hasOwnProperty("image_id") ? "Image" : lastMessage.message}
                                    </div>
                                </div>
                                {/* Right time container */}
                                <div className="relative flex flex-row h-full w-[25%]">
                                    <div className={`relative flex h-[60%] w-full flex-row top-[30%] justify-center text-xs lg:text-sm ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} font-medium`}>
                                        {lastMessage.sender_id === props.curr_user
                                            ? "Sent " + time
                                            : time
                                        }
                                    </div>
                                </div>
                        </div>
                    </div>
                    </div> : 
                        // otherwise group conversation so check if the members is not null
                        element.members.length > 0/*getLenMembers(element) > 0*/ ? 
                            <div
                                key={idx}
                                className={`relative flex-none flex flex-row h-[12%] w-[96%] text-[#FFD166] bg-transparent hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} rounded-2xl mt-2 hover:cursor-pointer`}
                                onClick={(e) => {
                                    console.log("========\n2nd DIV PRESSED\n========")
                                    console.log("CLICKED BY USER?", e.isTrusted);
                                    // props.setPressed(element); 
                                    // let contact = element;
                                    let timestamp = new Date().toISOString()
                                    let contact = {
                                    ...element,
                                    opened_at: element.opened_at.map(obj =>
                                        obj.id === props.curr_user ? { id:obj.id, opened_at: timestamp } : obj
                                    )};
                                    props.setCurrContact(contact); 
                                    // console.log("clicked")
                                }}
                            >
                                <div className="flex flex-row w-[15%] h-full justify-center items-center">
                                    {/* Use base64 data for image */}
                                    {getImageGroup(element).data !== "" ? <img
                                        src={getImageGroup(element).data}
                                        className="h-10 w-10 rounded-full"
                                        alt="Profile"
                                    /> : 
                                        <img src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "userProfile2.png"}`} className="h-12 w-12 rounded-full pointer-events-none"></img>}
                                </div>
                                <div className="flex w-[85%] flex-col">
                                    <div className="relative flex flex-row h-[50%] w-full items-center">
                                        <div className="w-[75%] h-full flex flex-row items-end">
                                            <div className={`indent-[10px] text-base lg:text-lg xl:text-xl font-medium font-sans ${props.themeChosen === "Dark" ? "text-gray-300" : "text-black"}`}>
                                                {element.group_name}
                                            </div>
                                        </div>
                                        <div className="w-[25%] h-full flex flex-row justify-center items-end">
                                            <div className={`flex flex-row justify-center items-center rounded-full contain-size text-xs lg:text-sm xl:text-base ${getUnreadMessages(element) > 0 ? 'bg-green-700' : ''} ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} bg-contain h-[60%] w-[50%] text-white`}>
                                                {(element.message.length > 0 && getLastMessageGroup(element).sender_id !== curr_user && getUnreadMessages(element) > 0) ? getUnreadMessages(element) : ""}
                                            </div> 
                                        </div>
                                    </div>
                                    <div className="relative flex w-full h-[50%] items-center">
                                        {/* Left text container */}
                                        <div className="relative flex flex-row h-full w-[75%]">
                                            <div className={`indent-[10px] flex h-full w-full items-start text-xs lg:text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-800"} font-medium overflow-x-hidden`}>
                                                {element.message.length > 0 && (getLastMessageGroup(element).message).hasOwnProperty("image_id") ? "Image" : getLastMessageGroup(element).message}
                                            </div>
                                        </div>
                                        {/* Right time container */}
                                        <div className="relative flex flex-row h-full w-[25%]">
                                            <div className={`relative flex h-[60%] w-full flex-row top-[30%] justify-center text-xs lg:text-sm ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} font-medium`}>
                                                {(element.message.length > 0) ? (getLastMessageGroup(element).sender_id === curr_user || getLastMessageGroup(element).contact_id === curr_user
                                                    ? "Sent " + getLastMessageGroup(element).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                                    : getLastMessageGroup(element).timestamp.split("T")[1].split(".")[0].slice(0, 5)) : ""
                                                }
                                            </div>
                                        </div>
                                </div>
                                </div>
                            </div>
                    
                        : <></>
                    )}
                    
                )}
                    
                { props.filteredContacts === null && props.contacts.map((element: any, idx: number) => (
                    ((element.sender_id !== null && element.sender_id === props.curr_user) || (element.contact_id !== null && element.contact_id === props.curr_user)) ?
                    <div
                        key={idx}
                        className={`relative h-[12%] left-[2%] w-[96%] ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} bg-transparent bg-opacity-60 flex flex-row rounded-2xl mt-2 hover:bg-[#ACCBE1] hover:bg-opacity-40`}
                        onClick={(e) => {
                            console.log("============\n3rd DIV PRESSED\n=============")
                            console.log("CLICKED BY USER?", e.isTrusted);
                            props.setPressed(element); 
                            // let contact = element;
                            let timestamp = new Date().toISOString()
                            let contact = {
                                ...element,
                                opened_at: element.opened_at.map(obj =>
                                    obj.id === props.curr_user ? { id:obj.id, opened_at: timestamp } : obj
                            )};
                            props.setCurrContact(contact); 
                            console.log("clicked")
                        }}
                    >
                        <div className="flex w-[10%] justify-center items-center">
                            {/* Use base64 data for image */}
                            <img
                                src={getImage(element).data}
                                className="h-12 w-12 rounded-full"
                                alt="Profile"
                            />
                        </div>
                        <div className="flex w-[90%] flex-col">
                            <div className="flex h-[60%] w-full items-center flex-row">
                                <div className="w-[80%] h-full flex flex-row items-center">
                                    <div className={`indent-[20px] text-xl font-medium font-sans ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"}`}>
                                        {getNameWithUserId(element)}
                                    </div>
                                </div>
                                <div className="w-[20%] h-full flex flex-row justify-center items-end">
                                    <div className={`flex flex-row justify-center items-center rounded-full contain-size text-xl ${getUnreadMessages(element) > 0 ? 'bg-green-700' : ''} 
                                                    bg-contain h-[60%] w-[50%] ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"}`}>
                                        {(element.message.length > 0) && element.message[0].recipient_id === curr_user && getUnreadMessages(element) !== 0 ? getUnreadMessages(element) : ""}
                                    </div> 
                                </div>
                            </div>
                            <div className="relative flex w-full h-[40%] items-center">
                                {/* Left text container */}
                                <div className="relative flex flex-row h-full w-[75%]">
                                    <div className={`indent-[20px] flex h-full w-full items-start text-sm font-medium ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} font-sans`}>
                                        {getLastMessage(element, idx).message}
                                    </div>
                                </div>
                                {/* Right time container */}
                                <div className="relative flex flex-row h-full w-[25%]">
                                    <div className="relative flex h-[60%] w-full flex-row top-[30%] justify-center text-base text-gray-300 font-medium">
                                        {getLastMessage(element, idx).sender_id === curr_user
                                            ? "Sent " + getLastMessage(element, idx).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                            : getLastMessage(element, idx).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                        }
                                    </div>

                                </div>
                        </div>
                        </div>
                    </div> : 
                        // otherwise group conversation so check if the members is not null
                        element.is_group === true && getLenMembers(element) > 0 ? 
                            <div 
                                key={idx}
                                className={`relative h-[12.5%] left-[2%] w-[96%] text-[#FFD166] bg-transparent bg-opacity-60 flex flex-row rounded-2xl mt-2 hover:bg-[#ACCBE1] hover:bg-opacity-40`}
                                onClick={() => {
                                    props.setPressed(element); 
                                    // let contact = element;
                                    let timestamp = new Date().toISOString()
                                    let contact = {
                                        ...element,
                                        opened_at: element.opened_at.map(obj =>
                                            obj.id === props.curr_user ? { id:obj.id, opened_at: timestamp } : obj
                                    )};
                                    props.setCurrContact(contact); 
                                    console.log("clicked")}}
                            >
                                <div className="flex w-[10%] justify-center items-center">
                                    {/* Use base64 data for image */}
                                    {getImageGroup(element).data !== "" ? <img
                                        src={getImageGroup(element).data}
                                        className="h-12 w-12 rounded-full"
                                        alt="Profile"
                                    /> : 
                                        <img src={`${props.themeChosen === "Dark" ? './userProfile2.png' : 'userProfile_nobg.png'}`} className="h-12 w-12 rounded-full pointer-events-none"></img>}
                                </div>
                                <div className="flex w-[90%] flex-col">
                                    <div className="flex h-[50%] w-full items-center flex-row">
                                        <div className="w-[80%] h-full">
                                            <div className="indent-[20px] text-xl font-medium font-sans text-black">
                                                {element.group_name}
                                            </div>
                                        </div>
                                        <div className="w-[20%] h-full flex flex-row justify-center">
                                            <div className="rounded-full contain-size bg-green-700 justify-center bg-contain h-full">
                                                AAAAA{/* {element.message.length > 0 && getLastMessageGroup(element).sender_id !== curr_user && getUnreadMessages(element, idx)} */}
                                            </div> 
                                        </div>
                                    </div>
                                    <div className="relative flex w-full h-[50%] items-center">
                                        {/* Left text container */}
                                        <div className="relative flex flex-row h-full w-[80%]">
                                            <div className="indent-[20px] flex h-full w-full items-center text-sm text-gray-600 font-medium">
                                                AAA{/* {(getLastMessageGroup(element).message).hasOwnProperty("image_id") ? "Image" : getLastMessageGroup(element).message} */}
                                            </div>
                                        </div>
                                        {/* Right time container */}
                                        <div className="relative flex flex-row h-full w-[20%]">
                                            <div className="flex h-full w-full flex-row items-center text-sm text-gray-600 font-medium">
                                                AAA{/* {getLastMessageGroup(element).user_id === curr_user
                                                    ? "Sent " + getLastMessageGroup(element).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                                    : getLastMessageGroup(element).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                                } */}
                                            </div>

                                        </div>
                                </div>
                                </div>
                            </div>
                    
                        : <></>))
                    }
            </div>
        </div>
    );
}

export function Groups(props) {

    const [usernameSearch, setUsernameSearch] = useState('')
    const [filteredUsersG, setFilteredUsersG] = useState([])
    const [removedFromAddingToGroup, setToRemoveFromAddingToGroup] = useState(null)
    const [finishingSettingUpGroup, setFinishingSettingUpGroup] = useState(false)
    const [groupName, setGroupName] = useState("")
    const [nameAlreadyExists, setNameAlreadyExists] = useState(false)
    const [description, setDescription] = useState("")
    const [newGroupImage, setNewGroupImage] = useState(null)
    const [hoveringGroupIcon, setHoveringGroupIcon] = useState(false)

    async function setNameAlreadyExistsAsync(val : boolean) {
        setNameAlreadyExists(val)
    }

    async function setFinishingSettingUpGroupAsync(val : boolean) {
        setFinishingSettingUpGroup(val)
    }
    
    function getNameWithUserId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user.username : "";
    }    

    function getNameUser(user: any){
        if (user !== null) return user.username;
        else return ''
    }

    async function setGroupNameAsync(val: string) {
        setGroupName(val)
    }

    useEffect(() => {

        console.log('props.users in Groups = ' + JSON.stringify(props.users))

        filtUsers('')

    }, [])

    useEffect(() => {
        console.log("filteredUsersG = " + JSON.stringify(filteredUsersG))
        
        setToRemoveFromAddingToGroup(null)

    }, [filteredUsersG])

    useEffect(() => {
        console.log("contacts in new group changed " + JSON.stringify(props.contactsInNewGroup))

        /*  */
        if(filteredUsersG.length !== 0) 
        {
            var filteredUsersWithoutAdded = filteredUsersG.filter((elem : any) => !props.contactsInNewGroup.some((c:any) => c.id === elem.id))
            setFilteredUsersG(filteredUsersWithoutAdded)
        }

    }, [props.contactsInNewGroup])

    useEffect(() => {
        if(removedFromAddingToGroup !== null) {
            setFilteredUsersG(() => [...filteredUsersG, removedFromAddingToGroup])
        }
    }, [removedFromAddingToGroup])

    function getImage(contact: any) {
        const image = props.images.find((image: any) => image.user_id === contact.contact_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    function getImageUser(user: any) {
        const image = props.images.find((image: any) => image.user_id === user.id)
        return image || { data: "" }; // Ensure we return a fallback value
    }

    function getNameUser2(usr: any) {
        if(usr !== null) {
            return usr.username;
        } 
        
        return ""
    }

    function getProfileImage(contact: any, type_user : number) {
        const user = props.users.find((user) => {
            if(type_user === 0){
                return user.id === props.curr_user
            } else {
                return contact.contact_id === user.id
            }
        })
        const image = props.images.find((image: any) => image.id === user.profile_pic_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    async function createGroup() {
        console.log("In create group")
        const curr_user = props.users.find((usr) => props.curr_user === usr.id )

        let ids = []
        for(let i = 0; i < props.contactsInNewGroup.length ; i++){
            ids.push(props.contactsInNewGroup[i].id)
        }

        console.log("description = " + JSON.stringify(description))

        let data = {
            "admin": curr_user.id,
            "users": [...ids, curr_user.id],
            "group_name": groupName,
            "description": description,
            "image": newGroupImage
        }
        // console.log("ids in new group: " + JSON.stringify(data))

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        
        console.log("Before request to server")

        try {
            const response = await fetch('http://localhost:3002/createGroup', requestOptions)

            if(response.status === 200) {
                console.log("Group created successfully")
                return 200;
            }
            else {
                if(response.status === 409) {
                    console.log("Group with the same name already exists")
                    return 409;
                }
                else if(response.status === 500) {
                    console.log("Server error")
                    return 500;
                }
            }
        } catch(err) {
            console.error("Group creation failed")
            return -1;
        }
    }

    function filtUsers (val: string) {
        const users_matching_filter = props.users.filter(
            usr => usr.username.includes(val) && usr.id !== props.curr_user
        );

        setFilteredUsersG(users_matching_filter)
    } 

    return (
        <div className="absolute left-0 top-0 w-full h-full">
            {finishingSettingUpGroup && <div className="relative left-0 top-0 w-full h-[8%]">
                <div className="relative flex flex-row top-0 h-full w-full items-center">
                    <div className={`relative indent-[20px] left-[2%] h-[70%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl hover:cursor-pointer`} onClick={() => {setFinishingSettingUpGroupAsync(false)}}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="justify-center items-center max-h-[70%] aspect-square"></img>
                    </div>
                    <div className="flex w-[80%] left-0 indent-[20px] h-full text-lg xl:text-xl font-semibold flex-col justify-center items-start text-white font-sans">Create group</div>
                </div>
            </div>}
            {finishingSettingUpGroup && (
                <div className="relative flex flex-col left-0 top-0 w-full h-[30%] justify-center items-center">
                    <div className="absolute w-full h-full">
                    <div className="relative w-full h-full flex flex-col justify-center items-center">
                        <div className="relative flex flex-col w-[50%] h-[50%] aspect-square justify-center items-center hover:cursor-pointer" /*onClick={() => {document.getElementById("groupImageInput")?.click()}}*/ onMouseEnter={() => {setHoveringGroupIcon(true)}} onMouseLeave={() => {setHoveringGroupIcon(false)}}>
                        {!newGroupImage && <img src="/group_icon-nobg.png" className={`absolute flex w-full h-full aspect-square ${hoveringGroupIcon ? 'opacity-30' : 'opacity-60'}`}/>}
                        {newGroupImage && <img src={newGroupImage} className={`absolute flex w-full h-full aspect-square ${hoveringGroupIcon ? 'opacity-30' : 'opacity-100'} rounded-full`}/>}
                        <div className="absolute flex flex-col w-[60%] h-[60%] justify-center items-center">
                            {hoveringGroupIcon && <img src="/camera-icon.png" className="relative flex flex-row w-[60%] h-[60%] justify-center items-center"/>}
                            {hoveringGroupIcon && <div className="relative flex flex-row w-full h-[40%] text-center justify-center items-center">Upload group picture..</div>}
                        </div>
                        {/* Hidden file input */}
                        <input
                            id="groupImageInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const base64 = reader.result as string;
                                console.log("Base64 image:", base64);
                                // you can store it in state:
                                setNewGroupImage(base64);
                            };
                            reader.readAsDataURL(file);
                            }}
                        />
                        </div>
                    </div>
                    </div>
                </div>
                )}

            {finishingSettingUpGroup && <div className="relative flex flex-col left-0 top-0 w-full h-[10%] justify-center items-center">
                    <input type="text" className="flex flex-row indent-[10px] w-[80%] h-[60%] outline-none bg-transparent border-b-2 border-gray-700 text-base text-white"
                        placeholder="Enter group name here.." 
                        value={groupName} 
                        onChange={(e) => {
                            const newGroupName = e.target.value
                            setGroupNameAsync(newGroupName)
                            console.log("groupName = " + newGroupName)
                            props.fetchContacts();
                            const group_w_name = props.contacts.filter((contact) => {return (contact.members.length > 1 && contact.group_name === newGroupName)})
                            if(group_w_name.length > 0) setNameAlreadyExistsAsync(true)
                            else setNameAlreadyExistsAsync(false) 
                        }}
                        >
                    </input>
                    {nameAlreadyExists && <div className="relative flex flex-row indent-[20px] w-[80%] h-[40%] text-red-600 text-base">Group name already exists!</div>}
            </div>}
            {finishingSettingUpGroup && <div className="relative flex flex-col left-0 top-0 w-full h-[20%] justify-center items-center">
                    <textarea 
                        className="relative px-[10px] pt-2 pb-2 w-[80%] h-[60%] outline-none bg-transparent border-2 border-gray-700 rounded-xl text-base text-white align-top"
                        placeholder="Add description.."
                        value={description}
                        onChange={(e) => {
                            const description = e.target.value
                            setDescription(description)
                        }}
                        onKeyDown={(e) => {
                            if(e.key === "Enter"){
                            console.log("Changed description")
                            /* Update description in DB */
                            }
                        }}
                    />
                    {nameAlreadyExists && <div className="relative flex flex-row w-[80%] h-[40%] text-red-600 text-base">Group name already exists!</div>}
            </div>}
            {!finishingSettingUpGroup && <div className="relative left-0 top-0 w-full h-[15%]">
                <div className="relative flex flex-row top-0 h-[50%] w-full items-center">
                    <div className={`relative indent-[20px] left-[2%] h-[70%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl hover:cursor-pointer`} onClick={() => {props.setAddContact(false); props.setNewGroupPress(false); setFinishingSettingUpGroup(false); props.setContactsInNewGroup([])}}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="justify-center items-center max-h-[70%] aspect-square"></img>
                    </div>
                    <div className="flex w-[80%] indent-[20px] h-full text-base lg:text-lg xl:text-xl font-semibold flex-col justify-center items-start text-white font-sans">Add group members</div>
                </div>
                <div className="relative left-0 top-0 h-[40%] flex flex-row justify-center items-center">
                    {/* First child div */}
                    <div className="absolute left-[2%] top-[7%] w-[96%] h-full rounded-2xl border-[#57CC99] border-2 bg-[#0D1317]">
                        <div className="relative top-0 left-0 h-full w-full flex flex-row">
                            <div className='relative left-0 top-0 w-[15%] h-full flex flex-col justify-center items-center'>
                                <img className='absolute max-w-[50px] max-h-[50px] w-[60%] h-[60%]' src="/searchIcon2-1.png"></img>
                            </div>
                            <div className='relative left-[2%] top-0 w-[86%] h-full flex flex-col justify-center items-start indent-2'>
                                <input className="absolute left-0 top-0 w-full h-full outline-none text-white bg-transparent overflow-x-auto text-base lg:text-lg xl:text-xl" 
                                    value={usernameSearch} placeholder="Search user to add.."
                                    onChange={async (e) => { 
                                        const val = e.target.value;
                                        setUsernameSearch(val);
                                        filtUsers(val);
                                    }}
                                >       
                                </input>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
            {!finishingSettingUpGroup && props.contactsInNewGroup.length !== 0 && <div className="relative left-0 top-0 w-full h-[15%] flex flex-col justify-center items-center">
                <div className="relative top-[5%] h-full grid grid-flow-row-dense auto-rows-max grid-cols-[repeat(auto-fit,minmax(25%,50%))] gap-2 items-center w-[80%] overflow-y-scroll scrollbar-hide">
                {props.contactsInNewGroup.map((contact, idx) => (
                    <div key={idx} className="relative text-md bg-blue-500 w-full h-[40px] flex flex-row justify-center items-center rounded-full">
                        <div className="relative w-[70%] h-full flex flex-row items-center pl-5 overflow-hidden">{getNameUser(contact)}</div>
                        <div className="relative w-[30%] h-full flex flex-row items-center justify-center">
                            <img
                                src="./xicon.png"
                                className="w-6 h-6"
                                onClick={() => {
                                    props.removeContactFromGroup(contact);
                                setToRemoveFromAddingToGroup(contact)
                                }}
                            ></img>
                        </div>
                    </div>
                ))}
                </div>
            </div>}
            {!finishingSettingUpGroup && <div className={`relative flex top-[2%] flex-col w-full ${props.contactsInNewGroup.length !== 0 ? 'h-[58%]' : 'h-[73%]' } justify-center items-center overflow-y-scroll`}>
                { filteredUsersG !== null && filteredUsersG.map((element: any, idx: number) => (
                // this is the normal conversation (1 on 1)
                <div
                    key={idx}
                    className={`relative flex-none flex flex-row h-[15%] w-[96%] top-0 bg-transparent bg-opacity-60 rounded-lg hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"}`}
                    onClick={async () => { await props.setContactsInNewGroup([...props.contactsInNewGroup, element]); console.log("clicked")}}
                >
                    <div className="relative flex w-[15%] h-full justify-center items-center">
                        {/* Use base64 data for image */}
                        {getImageUser(element).data !== "" ? <img
                            src={`data:image/jpg;base64,${getImageUser(element).data}`}
                            className="h-10 w-10 rounded-full"
                            alt="Profile"
                        /> : getImageUser(element).data !== "" ? <img
                            src={`data:image/jpg;base64,${getImageUser(element).data}`}
                            className="h-10 w-10 rounded-full"
                            alt="Profile"></img> : 
                            <img src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "userProfile2.png"}`} className="h-10 w-10 rounded-full"></img>}
                    </div>
                    <div className="relative flex flex-col w-[85%]">
                        <div className="relative flex flex-row h-[50%] w-full items-center">
                            <div className="w-[75%] h-full flex flex-row items-end">
                                <div className={`indent-[10px] text-base xl:text-lg font-medium font-sans ${props.themeChosen === "Dark" ? "text-gray-300" : "text-black" } `}>
                                    {getNameUser2(element)}
                                </div>
                            </div>
                            <div className="w-[25%] h-full flex flex-row justify-center items-end">
                                <div className="rounded-full contain-size text-2xl bg-green-700 justify-center bg-contain h-full">
                                </div> 
                            </div>
                        </div>
                        <div className="relative flex w-full h-[40%] items-center">
                            {/* Left text container */}
                            <div className="relative flex flex-row h-full w-[80%]">
                                <div className="indent-[10px] flex flex-row h-full w-full items-start md:text-[11px] lg:text-xs xl:text-sm text-gray-300 font-medium truncate">
                                    {element.about}
                                </div>
                            </div>
                            {/* Right time container */}
                            <div className="relative flex flex-row h-full w-[20%]">
                                <div className="flex h-full w-full flex-row items-center justify-center text-lg text-gray-300 font-medium">
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>))}
            </div>}
            <div className="relative flex flex-row w-full h-[10%] items-center justify-center">
                <div className={`relative flex flex-row justify-center items-center w-[10%] h-[60%] hover:bg-gray-500 ${props.themeChosen === "Dark" ? "bg-opacity-40" : "bg-opacity-30"} hover:rounded-xl hover:cursor-pointer rounded-xl`}>
                    <img
                        src={`${finishingSettingUpGroup ? (props.themeChosen === "Dark" ? '/forward-nobg.png' : "forward-black.png") : (props.themeChosen === "Dark" ? './plus-sign-2.png' : './plus-icon-black.png')}`}
                        className="h-[40%] flex items-center"
                        onClick={
                            async () => 
                                { 
                                    if(!finishingSettingUpGroup) setFinishingSettingUpGroupAsync(true); 
                                    else {
                                        props.fetchContacts();
                                        const group_w_name = props.contacts.filter((contact) => {return (contact.members.length > 1 && contact.group_name === groupName)})
                                        console.log("group_w_name = " + JSON.stringify(group_w_name))
                                        if(group_w_name.length === 0) {
                                            console.log("Did not find group with name = " + JSON.stringify(groupName))
                                            let success = await createGroup()
                                            if(success === 200) {
                                                props.setContactsInNewGroup([]); props.fetchUsers(); props.fetchContacts(); props.fetchImages(); 
                                                setFinishingSettingUpGroupAsync(false); props.setNewGroupPress(false);
                                            } else {
                                                if(success === 409) alert("Group with same name already exists")
                                                else alert("Error! Could not create group!")
                                            }
                                        } else {
                                            console.log("Group with name " + JSON.stringify(groupName) + " already exists!")
                                            setNameAlreadyExistsAsync(true)
                                        }
                                    }
                                }
                            }
                    ></img>
                </div>
            </div>
        </div>
    );
}

export function Contacts2( props: any) {

    // let curr_user = 1

    const isBase64 = value => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value);

    // here I need to have current user .. so then I can extract its contacts .. 
    // let's say for simplicity curr_user = 1
    // and here we extract its contacts and the messages that happen most recently are shown first

    function getNameWithUserId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user.username : "";
    }

    function getUser(contact: any) {
        return props.users.find((user) => user.id === contact.contact_id);
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
        if(last_msg.recipient_id === props.curr_user) {
            for(let i = lenMsgs - 1; i > -1 ; i--){
                if(contact.message[i].recipient_id === props.curr_user) cnt_unread += 1
                else break
            }
        }
        return cnt_unread
    }

    function getImage(contact: any) {
        console.log("contact = " + JSON.stringify(contact))
        if(contact.is_group === false) {
            const image = props.images.find((image: any) => image.sender_id === contact.contact_id);
            return image || { data: "" }; // Ensure we return a fallback value
        } else {
            const image = props.images.find((image: any) => image.id === contact.group_pic_id);
            return image || { data: "" }; // Ensure we return a fallback value
        }
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
        const image = props.images.find((image: any) => image.id === user.profile_pic_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    return (
        <div className="absolute left-0 top-[22%] w-full h-[76%]">
            <div className="relative top-0 left-0 h-full w-full flex flex-col overflow-scroll">
                { props.filteredContacts !== null && props.filteredContacts.map((element: any, idx: number) => (
                    (element.sender_id === props.curr_user && !props.contactsInNewGroup.includes(element)) ?
                    <div
                        key={idx}
                        className={`relative h-[12%] w-full bg-gray-600 bg-opacity-60 flex flex-row border-y-gray-700 border-t-[1px] hover:bg-gray-500 hover:bg-opacity-40`}
                        onClick={() => {props.setPressed2(element); props.setContactsInNewGroup([...props.contactsInNewGroup, element])}}// here add to the list of contacts console.log("clicked")}}
                    >
                        <div className="flex w-[10%] justify-center items-center">
                            {(element !== null && element.is_group === false && getImage(element).data !== "") ? 
                                <img src={`data:image/jpg;base64,${getImage(element).data}`} className="max-h-[60%] rounded-full"></img> :
                                (element !== null && element.is_group === false && getImage(element).data === "") ?
                                <img src={`./userProfile2.png`} className="max-h-[60%] rounded-full"></img> :
                            (element !== null && element.is_group === true && element.group_pic_id !== null) ? 
                                <img src={`data:image/jpg;base64,${getImage(element).data}`} className="max-h-[60%] rounded-full"></img> :
                                (element !== null && element.is_group === true && element.group_pic_id === null) ? 
                                <img src={`./userProfile2.png`} className="max-h-[60%] rounded-full"></img> : <></>                        
                            }
                        </div>
                        <div className="flex w-[90%] flex-col">
                            <div className="flex h-[50%] w-full items-center flex-row">
                                <div className="w-[80%] h-full">
                                    <div className="indent-[20px] text-xl font-medium font-sans">
                                        {getNameWithUserId(element)}
                                    </div>
                                </div>
                                <div className="w-[20%] h-full flex flex-row justify-center">
                                    <div className="rounded-full contain-size bg-green-700 justify-center bg-contain h-full text-sm">
                                        {element.recipient_id === props.curr_user && getUser(element).about}
                                    </div> 
                                </div>
                            </div>
                            <div className="relative flex w-full h-[50%] items-center">
                                {/* Left text container */}
                                <div className="relative flex flex-row h-full w-[80%]">
                                    <div className="indent-[20px] flex h-full w-full items-center text-sm text-gray-600 font-medium overflow-x-hidden">
                                        {getUser(element).about}
                                    </div>
                                </div>
                                {/* Right time container */}
                                <div className="relative flex flex-row h-full w-[20%]">
                                    <div className="flex h-full w-full flex-row items-center text-sm text-gray-600 font-medium">
                                    </div>
                                </div>
                        </div>
                        </div>
                    </div> : <></>))}
                { props.filteredContacts === null && props.contacts.map((element: any, idx: number) => (
                    element.sender_id === props.curr_user ?
                    <div
                        key={idx}
                        className={`relative h-[12%] w-full bg-gray-500 bg-opacity-50 flex flex-row border-y-black border-2`}
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
                                        {getUser(element).about}
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