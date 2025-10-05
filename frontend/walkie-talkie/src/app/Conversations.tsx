'use client'

import Image from 'next/image'
import React, {useState, useEffect, useRef} from 'react';

export default function Conversations( props : any) {
    
    const [currentSearch, setCurrSearch] = useState('');
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [menuPress, setMenuPress] = useState(false)
    const [newChatPress, setNewChatPress] = useState(false)
    const [newGroupPress, setNewGroupPress] = useState(false)
    const [logOut, setLogOut] = useState(false)
    const [pressed2, setPressed2] = useState(false) // this is for selecting contacts for groups
    const [contactsInNewGroup, setContactsInNewGroup] = useState([])
    const [addContact, setAddContact] = useState(false) // adding contact

    /* This is for adding users to contacts IF IN the ADD CONTACT mode */
    const [filteredUsers, setFilteredUsers] = useState([])

    useEffect(() => {
        if(props.contacts !== null) {
            filterContacts(currentSearch)
            console.log("filteredContacts = " + JSON.stringify(filteredContacts))
        }
    }, [props.contacts, currentSearch])

    useEffect(() => {
        props.setLoggedIn(false)
    }, [logOut])

    function getUserWithId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user : {};
    }

    async function filterContacts(val : string) { 
        console.log("In filteredContacts .. ")     
        console.log("users = " + JSON.stringify(props.users) + " type users = " + typeof(props.users))     
        console.log("contacts = " + JSON.stringify(props.contacts))     
        setFilteredContacts(props.contacts.filter((contact) => {
            if(contact.is_group === false) {
                const user = props.users.find((user) => user.id === contact.contact_id);
                return user?.username.includes(val); // Safely access `username` using optional chaining
            } else {
                return contact.group_name.includes(val);
            }
        }))
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
            );
            });

            return isInContacts === undefined; // ✅ was `null`
        });

        console.log("not in contacts matching filter:", not_in_contacts);

        setFilteredUsers(not_in_contacts);
        // return not_in_contacts;
    }

    async function removeContactFromGroup(contact) {
        setContactsInNewGroup(contactsInNewGroup.filter((elem) => ( contact.contact_id !== elem.contact_id )))
    }

    return (
        <div className="relative left-[8%] w-[30%] top-[5%] h-[90%] bg-[#7DD8C3] rounded-r-xl border-white border-2">
            {newGroupPress && <GroupMaking setNewGroupPress={setNewGroupPress} contactsInNewGroup={contactsInNewGroup} users={props.users} 
                removeContactFromGroup={removeContactFromGroup} setContactsInNewGroup={setContactsInNewGroup} curr_user={props.curr_user} 
                fetchUsers={props.fetchUsers} fetchContacts={props.fetchContacts} fetchImages={props.fetchImages}></GroupMaking>}
            {newGroupPress && <Contacts2 users={props.users} contacts={props.contacts} filteredContacts={filteredContacts} 
                curr_user={props.curr_user} images={props.images} setNewGroupPress={setNewGroupPress} setPressed2={setPressed2} 
                setContactsInNewGroup={setContactsInNewGroup} contactsInNewGroup={contactsInNewGroup}></Contacts2>}
            {/* {addContact && } */}
            {!newGroupPress && <OtherOptions setMenuPress={setMenuPress} setNewChatPress={setNewChatPress} addContact={addContact} setAddContact={setAddContact}></OtherOptions>}
            {!newGroupPress && <MenuDropdown menuPress={menuPress} setMenuPress={setMenuPress} onOutsideClick={setMenuPress} setNewGroupPress={setNewGroupPress} setLogOut={setLogOut} setAddContact={setAddContact}></MenuDropdown>}
            {!newGroupPress && <SearchBar currentSearch={currentSearch} setCurrSearch={setCurrSearch} filterContacts={filterContacts} filterUsers={filterUsers} addContact={addContact}></SearchBar>}
            {!newGroupPress && !addContact && <Contacts currentSearch={currentSearch} users={props.users} filteredContacts={filteredContacts} filteredUsers={filteredUsers} contacts={props.contacts} curr_user={props.curr_user} images={props.images} setPressed={props.setPressed} setCurrContact={props.setCurrContact}></Contacts>}
            {!newGroupPress && addContact && <UsersToAddToContacts currentSearch={currentSearch} users={props.users} addContact={addContact} filteredContacts={filteredContacts} filteredUsers={filteredUsers} contacts={props.contacts} curr_user={props.curr_user} images={props.images} setPressed={props.setPressed} setCurrContact={props.setCurrContact}></UsersToAddToContacts>}
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
        (props.menuPress && <div ref={divRef} className="absolute left-[62%] top-[6%] w-[36%] h-[10%] flex flex-col rounded-md bg-gray-800 z-10" >
            <div className="relative flex flex-row justify-center items-center left-0 w-full rounded-t-md h-[50%] text-white text-base hover:bg-slate-400" onClick={() => {props.setNewGroupPress(true); props.setMenuPress(false);}}>New Group</div>
            <div className="relative flex flex-row justify-center items-center left-0 w-full rounded-t-md h-[50%] text-white text-base hover:bg-slate-400" onClick={() => {props.setAddContact(true); props.setMenuPress(false);}}>New Contact</div>
            <div className="relative flex flex-row justify-center items-center left-0 w-full rounded-b-md h-[50%] text-white text-base hover:bg-slate-400" onClick={() => {props.setLogOut(true); props.setMenuPress(false);}}>Log out</div>
        </div>)
    );
}

export function OtherOptions (props) {
    return (
        <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
            {props.addContact && <div className="relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-slate-400 hover:rounded-xl hover:cursor-pointer" onClick={() => {props.setAddContact(false)}}>
                    <img src="/go-back-2-icon.png" className="justify-center items-center max-h-[80%] aspect-square"></img>
                </div>} 
            {props.addContact && <div className="relative indent-[20px] left-[2%] w-[40%] text-2xl font-semibold text-black font-sans flex flex-row justify-start items-center">Add contact</div>}
            {!props.addContact && <div className="relative indent-[20px] left-[2%] w-[48%] text-2xl font-semibold text-black font-sans flex flex-row justify-start items-center">Chats</div>}
            <div className="relative left-[30%] w-[20%] h-full flex flex-row items-center">
                <div className="relative left-0 w-[50%] h-full hover:bg-slate-400 hover:rounded-xl flex flex-row items-center justify-center" onClick={() => {props.setNewChatPress(true)}}>
                    <img src="/newChat2.png" className="justify-end items-center max-h-[80%] max-w-[100%]"></img>
                </div>
                <div className="relative left-0 w-[50%] h-full hover:bg-slate-400 hover:rounded-xl flex flex-row items-center justify-center" onClick={() => {props.setMenuPress(true)}}>
                    <img src="/menu3.png" className="justify-end items-center max-h-[80%] max-w-[100%]"></img>
                </div>
            </div>
        </div>
    ); 
}

export function SearchBar( props : any ) {

    return (
        <div className="absolute left-[2%] top-[7%] w-[96%] h-[7%] rounded-2xl border-white border-2 bg-gray-500 bg-opacity-50">
            <div className="relative top-0 left-0 h-full w-full flex flex-row">
                <div className='relative left-0 top-0 w-[15%] h-full flex flex-col justify-center items-center'>
                    <img className='absolute max-w-[50px] max-h-[50px] w-[50%] h-[50%]' src="/search.png"></img>
                </div>
                <div className='relative left-[2%] top-0 w-[86%] h-full flex flex-col justify-center items-start indent-2'>
                    <input className="absolute left-0 top-0 w-full h-full outline-none text-white bg-transparent overflow-x-auto text-2xl" 
                        value={props.currentSearch}
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
        if(props.curr_user != -1) setCurrUser(curr_user);
    }, [props.curr_user])

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

    return (
        
        <div className="absolute left-0 top-[16%] w-full h-[84%]">
            <div className="relative top-0 left-0 h-full w-full flex flex-col overflow-scroll">
                { props.filteredUsers !== null && props.filteredUsers.map((element: any, idx: number) => (
                    // this is the normal conversation (1 on 1)
                    <div
                        key={idx}
                        className={`relative h-[12%] w-full bg-gray-600 bg-opacity-60 flex flex-row border-y-gray-700 border-t-[1px] hover:bg-gray-500 hover:bg-opacity-40`}
                        onClick={() => {props.setPressed(element); props.setCurrContact(element); console.log("clicked")}}
                    >
                        <div className="flex w-[10%] justify-center items-center">
                            {/* Use base64 data for image */}
                            {getImageUser(element).data !== "" ? <img
                                src={`data:image/jpg;base64,${getImageUser(element).data}`}
                                className="h-[75%] w-[75%] rounded-full"
                                alt="Profile"
                            /> : getImageUser(element).data !== "" ? <img
                                src={`data:image/jpg;base64,${getImageUser(element).data}`}
                                className="h-[75%] w-[75%] rounded-full"
                                alt="Profile"></img> : 
                                <img src="./userProfile.jpg" className="h-[75%] w-[75%] rounded-full"></img>}
                        </div>
                        <div className="flex w-[90%] flex-col">
                            <div className="flex h-[60%] w-full items-center flex-row">
                                <div className="w-[80%] h-full flex flex-row items-center">
                                    <div className="indent-[20px] text-2xl font-medium font-sans text-black">
                                        {getNameUser2(element)}
                                    </div>
                                </div>
                                <div className="w-[20%] h-full flex flex-row justify-center">
                                    <div className="rounded-full contain-size text-2xl bg-green-700 justify-center bg-contain h-full">
                                    </div> 
                                </div>
                            </div>
                            <div className="relative flex w-full h-[40%] items-center">
                                {/* Left text container */}
                                <div className="relative flex flex-row h-full w-[80%]">
                                    <div className="indent-[20px] flex flex-row h-full w-full items-start text-lg text-gray-300 font-medium">
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

    // here I need to have current user .. so then I can extract its contacts .. 
    // let's say for simplicity curr_user = 1
    // and here we extract its contacts and the messages that happen most recently are shown first

    function getNameWithUserId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user.username : "";
    }
     
    function getLastMessage(contact : any, idx: number) {
        let lenMsgs = contact.message.length
        if(contact.message.length === 0) return {"message" : "", "timestamp": "T     .", "curr_user": contact.sender_id, "recipient_id": contact.recipient_id}
        let last_msg = contact.message[lenMsgs - 1]
        console.log(`this is the ${idx}th contact in the list with the message = ${last_msg.message}`)
        return last_msg
    }

    function getUnreadMessages(contact: any, idx: number) {
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

    function getImage(contact: any) {
        const image = props.images.find((image: any) => image.user_id === contact.contact_id);
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
        console.log("contact in conversations = " + JSON.stringify(props.contacts))
    }, [props.contacts])

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
                    // this is the normal conversation (1 on 1)
                    (element.sender_id !== null && element.sender_id === props.curr_user) ? 
                    <div
                        key={idx}
                        className={`relative h-[12%] w-full bg-gray-600 bg-opacity-60 flex flex-row border-y-gray-700 border-t-[1px] hover:bg-gray-500 hover:bg-opacity-40`}
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
                            <div className="flex h-[60%] w-full items-center flex-row">
                                <div className="w-[80%] h-full flex flex-row items-center">
                                    <div className="indent-[20px] text-2xl font-medium font-sans text-black">
                                        {getNameWithUserId(element)}
                                    </div>
                                </div>
                                <div className="w-[20%] h-full flex flex-row justify-center">
                                    <div className="rounded-full contain-size text-2xl bg-green-700 justify-center bg-contain h-full">
                                        {element.recipient_id === curr_user && getUnreadMessages(element, idx)}
                                    </div> 
                                </div>
                            </div>
                            <div className="relative flex w-full h-[40%] items-center">
                                {/* Left text container */}
                                <div className="relative flex flex-row h-full w-[80%]">
                                    <div className="indent-[20px] flex flex-row h-full w-full items-start text-lg text-gray-300 font-medium">
                                        {(getLastMessage(element, idx).message).hasOwnProperty("image_id") ? "Image" : getLastMessage(element, idx).message}
                                    </div>
                                </div>
                                {/* Right time container */}
                                <div className="relative flex flex-row h-full w-[20%]">
                                    <div className="flex h-full w-full flex-row items-center justify-center text-lg text-gray-300 font-medium">
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
                        element.members.length > 0 && getLenMembers(element) > 0 ? 
                            <div
                                key={idx}
                                className={`relative h-[12%] w-full bg-gray-600 bg-opacity-60 flex flex-row border-y-gray-700 border-t-[1px] hover:bg-gray-500 hover:bg-opacity-40`}
                                onClick={() => {props.setPressed(element); props.setCurrContact(element); console.log("clicked")}}
                            >
                                <div className="flex w-[10%] justify-center items-center">
                                    {/* Use base64 data for image */}
                                    {getImageGroup(element).data !== "" ? <img
                                        src={`data:image/jpg;base64,${getImageGroup(element).data}`}
                                        className="h-[75%] w-[75%] rounded-full"
                                        alt="Profile"
                                    /> : 
                                        <img src="./userProfile.jpg" className="h-[75%] w-[75%] rounded-full"></img>}
                                </div>
                                <div className="flex w-[90%] flex-col">
                                    <div className="flex h-[60%] w-full items-center flex-row">
                                        <div className="w-[80%] h-full flex flex-row items-center">
                                            <div className="indent-[20px] text-2xl font-medium font-sans text-black">
                                                {element.group_name}
                                            </div>
                                        </div>
                                        <div className="w-[20%] h-full flex flex-row justify-center">
                                            <div className="rounded-full contain-size text-2xl bg-green-700 justify-center bg-contain h-full">
                                                {element.message.length > 0 && getLastMessageGroup(element).sender_id !== curr_user && getUnreadMessages(element, idx)}
                                            </div> 
                                        </div>
                                    </div>
                                    <div className="relative flex w-full h-[40%] items-center">
                                        {/* Left text container */}
                                        <div className="relative flex flex-row h-full w-[80%]">
                                            <div className="indent-[20px] flex h-full w-full items-start text-lg text-gray-300 font-medium">
                                                {element.message.length > 0 && (getLastMessageGroup(element).message).hasOwnProperty("image_id") ? "Image" : getLastMessageGroup(element).message}
                                            </div>
                                        </div>
                                        {/* Right time container */}
                                        <div className="relative flex flex-row h-full w-[20%]">
                                            <div className="flex h-full w-full flex-row items-center justify-center text-lg text-gray-300 font-medium">
                                                {(element.message.length > 0) ? (getLastMessageGroup(element).sender_id === curr_user
                                                    ? "Sent " + getLastMessageGroup(element).timestamp.split("T")[1].split(".")[0].slice(0, 5)
                                                    : getLastMessageGroup(element).timestamp.split("T")[1].split(".")[0].slice(0, 5)) : ""
                                                }
                                            </div>

                                        </div>
                                </div>
                                </div>
                            </div>
                    
                        : <></>))}
                    
                { props.filteredContacts === null && props.contacts.map((element: any, idx: number) => (
                    (element.sender_id !== null && element.sender_id === props.curr_user) ?
                    <div
                        key={idx}
                        className={`relative h-[12%] w-full bg-gray-600 bg-opacity-60 flex flex-row border-y-gray-700 border-t-[1px] hover:bg-gray-500 hover:bg-opacity-40`}
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
                            <div className="flex h-[60%] w-full items-center flex-row">
                                <div className="w-[80%] h-full flex flex-row items-center">
                                    <div className="indent-[20px] text-xl font-medium font-sans text-black">
                                        {getNameWithUserId(element)}
                                    </div>
                                </div>
                                <div className="w-[20%] h-full flex flex-row justify-center">
                                    <div className="rounded-full contain-size bg-green-700 justify-center bg-contain h-full">
                                        {(element.message.length > 0) && element.message[0].recipient_id === curr_user && getUnreadMessages(element, idx)}
                                    </div> 
                                </div>
                            </div>
                            <div className="relative flex w-full h-[40%] items-center">
                                {/* Left text container */}
                                <div className="relative flex flex-row h-full w-[80%]">
                                    <div className="indent-[20px] flex h-full w-full items-start text-sm font-medium text-white font-sans">
                                        {getLastMessage(element, idx).message}
                                    </div>
                                </div>
                                {/* Right time container */}
                                <div className="relative flex flex-row h-full w-[20%]">
                                    <div className="flex h-full w-full flex-row items-center justify-center text-sm text-gray-600 font-medium font-sans">
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
                                className={`relative h-[12%] w-full bg-gray-600 bg-opacity-60 flex flex-row border-y-gray-700 border-t-[1px] hover:bg-gray-500 hover:bg-opacity-40`}
                                onClick={() => {props.setPressed(element); props.setCurrContact(element); console.log("clicked")}}
                            >
                                <div className="flex w-[10%] justify-center items-center">
                                    {/* Use base64 data for image */}
                                    {getImageGroup(element).data !== "" ? <img
                                        src={`data:image/jpg;base64,${getImageGroup(element).data}`}
                                        className="h-[75%] w-[75%] rounded-full"
                                        alt="Profile"
                                    /> : 
                                        <img src="./userProfile.jpg" className="h-[75%] w-[75%] rounded-full"></img>}
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

export function GroupMaking(props) {

    const [usernameSearch, setUsernameSearch] = useState('')
    
    function getNameWithUserId(contact: any) {
        const user = props.users.find((user) => user.id === contact.contact_id);
        return user ? user.username : "";
    }    

    useEffect(() => {
        console.log("contacts in new group changed " + JSON.stringify(props.contactsInNewGroup))

    }, [props.contactsInNewGroup])

    async function createGroup() {
        console.log("In create group")
        const curr_user = props.users.find((usr) => props.curr_user === usr.id )

        let ids = []
        for(let i = 0; i < props.contactsInNewGroup.length ; i++){
            ids.push(props.contactsInNewGroup[i].contact_id)
        }

        let users = {
            "users": [...ids, curr_user.id]
        }
        console.log("ids in new group: " + JSON.stringify(users))

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users)
        };
        

        try {
            await fetch('http://localhost:3002/createGroup', requestOptions)
            console.log("Group created successfully")
        } catch(err) {
            console.error("Group creation failed")
        }
    }

    

    return (
        <div className="absolute left-0 top-0 w-full h-[20%]">
            <div className="relative flex flex-row h-[40%] w-full">
                <div className="relative flex flex-col justify-center items-center left-2 w-[15%] top-[15%] h-[70%] text-xl font-semibold text-black hover:bg-slate-500 rounded-md p-2" onClick={() => {props.setNewGroupPress(false)}}>
                    <img src="./xicon.png" className="w-[60%] h-full"></img> 
                </div> 
                <div className="flex w-[50%] h-full text-xl font-semibold flex-col justify-center items-start text-black font-sans">Create Group</div>
            </div>
            <div className="relative left-0 top-0 h-[30%] flex flex-row justify-center items-center">
                {/* First child div */}
                <div className="relative left-[5%] grid grid-flow-row-dense auto-rows-max grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2 items-center h-full w-[70%] overflow-y-scroll scrollbar-hide">
                    {props.contactsInNewGroup.map((contact) => (
                        <div className="relative text-md bg-blue-500 w-full h-[50px] flex flex-row items-center rounded-full">
                            <div className="relative w-[80%] h-full flex flex-row items-center pl-5">{getNameWithUserId(contact)}</div>
                            <div className="relative w-[20%] h-full flex flex-row items-center justify-center">
                                <img
                                    src="./xicon.png"
                                    className="w-6 h-6"
                                    onClick={() => {
                                        props.removeContactFromGroup(contact);
                                    }}
                                ></img>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Second child div */}
                <div className="relative flex flex-row justify-center w-[25%] h-full">
                    <img
                        src="./arrowimg2.png"
                        className="h-[60%] flex items-center hover:bg-gray-500"
                        onClick={() => { createGroup(); props.setContactsInNewGroup([]); props.fetchUsers(); props.fetchContacts(); props.fetchImages();}}
                    ></img>
                </div>
            </div>

            <div className="relative top-[10%] flex flex-row left-[5%] w-[75%] h-[20%] border-b-2 border-gray-500 z-20">
                <input placeholder="Search name" value={usernameSearch} className="left-[5%] w-[90%] h-full outline-none bg-transparent overflow-x-auto" 
                    onChange={(e) => {setUsernameSearch(e.target.value)}}></input>
            </div>
        </div>
    );
}

export function Contacts2( props: any) {

    let curr_user = 1

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
        if(last_msg.recipient_id === curr_user) {
            for(let i = lenMsgs - 1; i > -1 ; i--){
                if(contact.message[i].recipient_id === curr_user) cnt_unread += 1
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
                                        {element.recipient_id === curr_user && getUser(element).about}
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