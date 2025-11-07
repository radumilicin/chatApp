import { useEffect, useRef, useState } from 'react';
import useWebSocket from './webSocket';
import fs from "fs";

export default function CurrentChat( props: any ) {

    // const [ messages, setMessages] = useState([]); // Store received messages
    // const { isConnected, sendMessage } = useWebSocket(`ws://localhost:8080?userId=${props.curr_user}`, setMessages);
    const [text, setText] = useState('');
    const prevMessages = useRef(props.messages)
    const [allMessages, updateAllMessages] = useState([])
    const allMessagesPrev = useRef(allMessages)
    const contact = useRef(null)
    const image = useRef(null)

    // useEffect(() => {
    //     if(props.potentialContact !== props.prevPotentialContact.current)
    // }, [props.potentialContact])

    useEffect(() => {

    }, [])

    async function updateList(allMessages, newMessages: any[]){
        var elems = []
        for (const elem of newMessages) {
            // Assuming `message` is the unique key in each element
            if (!allMessages.some((msg) => msg.timestamp === elem.timestamp)) {
                // console.log("new message: " + JSON.stringify(elem.message))
                elems.push(elem);
            }
        }
        updateAllMessages((prev) => {
            const updatedMessages = [...prev, ...elems];
            allMessagesPrev.current = updatedMessages; // Update the reference
            return updatedMessages;
        });
        props.setMessages([]);
    }


    //gets all messages already existing in the DB
    useEffect(() => {
        // if(props.contact !== null){
        if(props.contact !== contact.current){

            if(props.contact.is_group) console.log("NEW CONTACT with name: " + props.contact.group_name)
            else console.log("NEW CONTACT with name: " + props.contact.sender_id === props.curr_user ? props.contact.contact_id : props.contact.sender_id)
            const emptyMessages = async () => {
                updateAllMessages(() => [])
                console.log("messages after emptying = " + JSON.stringify(allMessages))
            }
            emptyMessages()
            prevMessages.current = []

            const fetchMessages = async () => {
                try {
                    if(props.contact.is_group === false) {

                        const other_user = props.contact.sender_id === props.curr_user ? props.contact.contact_id : props.contact.sender_id
                        const response = await fetch(`http://localhost:3002/contacts?user=${props.curr_user}&contact_id=${other_user}`); // Replace with your API endpoint
                        if(!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`)
                        }

                        const result = await response.json();
                        // console.log("result = " + JSON.stringify(result) + "  \n\nmessage: " + JSON.stringify(result[0]?.message) + "\n\n")
                        await updateList(allMessages, result[0]?.message)
                        // console.log("allMessages after changing contact = " + JSON.stringify(allMessages));

                    } else {

                        const response = await fetch(`http://localhost:3002/contactsGroup?group_id=${props.contact.id}`); // Replace with your API endpoint
                        // console.log("response = " + JSON.stringify(response))
                        const result = await response.json();
                        // console.log("result = " + JSON.stringify(result) + "  \n\nmessage: " + JSON.stringify(result[0]?.message) + "\n\n")
                        await updateList(allMessages, result[0]?.message)
                        // console.log("allMessages after changing contact = " + JSON.stringify(allMessages));
                    }
                } catch(e) {
                    console.error("Error fetching messages:", e)
                }
            };
            fetchMessages()

            // const updateContactAndMessages = async () => {
            //     // setContact(props.contact)
            //     props.setMessages([])
            // }
            // updateContactAndMessages()

            // console.log("props.contact = " + props.contact)
        }
        else {
            if(contact.current !== null && props.contact.group_name !== contact.current.group_name){
                // console.log("previous group name =" + contact.current.group_name)
                // console.log("current group name =" + props.contact.group_name)
            }
        }
        contact.current = props.contact
        // console.log("current contact in CurrentChat: " + JSON.stringify(contact.current))

        image.current = getImage(props.contact)
        // }

        // if(props.contact !== null)
        //     updateAllMessages(props.contact.message)
    }, [props.contact])

    useEffect(() => {
        if(props.contact === contact.current) {  // this only happens when the contact user stays the same
            if(props.contact !== null) {
                
                if(props.contact.is_group) console.log("SAME CONTACT with name: " + props.contact.group_name)
                else console.log("SAME CONTACT with name: " + props.contact.sender_id === props.curr_user ? props.contact.contact_id : props.contact.sender_id)
            }
            const currMessages = [...allMessages]
            const messagesNotYetReceived = props.messages.slice(props.messages.length - prevMessages.current.length, props.messages.length)
            
            var ls = []
            // const initial_length = messagesNotYetReceived.length
            for(var i = messagesNotYetReceived.length - 1 ; i > -1 ; i--){
                if(messagesNotYetReceived[i].hasOwnProperty('message') && messagesNotYetReceived[i].hasOwnProperty('status')) {
                   messagesNotYetReceived.splice(i, 1)
                }
            }

            updateAllMessages([...currMessages, ...messagesNotYetReceived])
            prevMessages.current = allMessages

            // console.log("allMessages in messages = " + JSON.stringify(allMessages))
        }
    }, [props.messages])

    useEffect(() => {
        // console.log("Changed all messages: " + JSON.stringify(allMessages))
    }, [allMessages])


    const handleSendMessage = (msg) => {
        if (msg.trim() === '') return;

        const other_user = props.contact.sender_id === props.curr_user ? props.contact.contact_id : props.contact.sender_id

        const message = {
            sender_id: props.curr_user, // Replace with dynamic user ID
            recipient_id: other_user, // Replace with dynamic recipient ID
            message: msg,
            timestamp: new Date().toISOString(),
        };

        props.sendMessage(message);
        if(allMessages.length === 0) {
            // console.log("why is this triggering now?")
            updateAllMessages([message])    
        }
        else {
            // console.log("allMessages" + JSON.stringify(allMessages))
            updateAllMessages([...allMessages, message])
        }
        setText(''); // Clear input
    };

    const handleSendMessage2 = (msg) => {
        if (msg.trim() === '') return;

        var recipient_ids = []
        for(let i = 0; i < props.contact.members.length ; i++) {
            if(props.contact.members[i] !== props.curr_user) recipient_ids.push(props.contact.members[i])
        }

        const message = {
            sender_id: props.curr_user, // Replace with dynamic user ID
            recipient_ids: recipient_ids, // Replace with dynamic recipient ID
            group_id: props.contact.id,
            message: msg,
            timestamp: new Date().toISOString(),
        };

        props.sendMessage(message);
        if(allMessages.length === 0) {
            // console.log("why is this triggering now?")
            updateAllMessages([message])    
        }
        else {
            console.log("allMessages" + JSON.stringify(allMessages))
            updateAllMessages([...allMessages, message])
        }
        setText(''); // Clear input
    };

    function getImage(curr_contact: any) {

        if(curr_contact === null || curr_contact === undefined) return ""

        if(!curr_contact.is_group) {
            const image = props.images.find((image: any) => (image.user_id === curr_contact.sender_id && curr_contact.contact_id === props.curr_user) || 
                                                            (image.user_id === curr_contact.contact_id && curr_contact.sender_id === props.curr_user));
            return image || { data: "" }; // Ensure we return a fallback value
        } else {
            const image = props.images.find((image: any) => image.id === curr_contact.group_pic_id);
            return image || { data: "" }; // Ensure we return a fallback value
        }
    }

    function getNameContact(contact: any) {
        if(contact.is_group === true){
            console.log("contact name = " + JSON.stringify(contact.group_name))
            return contact.group_name 
        } else {
            return props.users.find((user) => (contact.contact_id === user.id && contact.sender_id === props.curr_user) || 
                                              (contact.sender_id === user.id && contact.contact_id === props.curr_user)).username
        }
    }

    function getUser() {
        const user = props.users.find((user: any) => (props.contact.contact_id === user.id && props.contact.sender_id === props.curr_user) || 
                                                     (props.contact.sender_id === user.id && props.contact.contact_id === props.curr_user)
                                     );
        return user || { data: "" }; // Ensure we return a fallback value
    }

    // get user from ID
    function getUserFromId(idUser: any) {
        const user = props.users.find((user: any) => user.id === idUser);
        return user || { data: "" }; // Ensure we return a fallback value
    }

    const isBase64 = value => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value);

    const findImageBasedOnID = (message: any) => {
        // console.log("message = " + JSON.stringify(message))
        const image = props.images.find((img) => { return img.id === message.image_id})
        // console.log("image =" + JSON.stringify(image))
        return image
    }

    function getUserWithId(user_id) {
        const user = props.users.find((user) => {return user.id === user_id})
        return user || {data: ""}
    }

    return (
        <div className="relative top-[5%] left-[8%] w-[58%] h-[90%] rounded-r-lg bg-[#637081] border-2  border-[#0D1317] bg-opacity-70">
            <div className={`absolute left-0 top-0 w-[100%] h-[15%] rounded-r-lg bg-[#0D1317] flex flex-row hover:cursor-pointer ${props.fontChosen === 'Sans' ? 'font-sans' : props.fontChosen === 'Serif' ? 'font-serif' : 'font-mono'}`} onClick={() => { props.setProfileInfo(true) }}>
                <div className="flex w-[10%] h-[100%] justify-end items-center">
                    {(props.contact !== null && props.contact.is_group === false && getImage(props.contact).data !== "") ? 
                        <img key={props.contact?.group_pic_id || props.contact?.contact_id} src={`data:image/jpeg;base64,${getImage(props.contact).data}`} className="w-14 h-14 rounded-full"></img> :
                        (props.contact !== null && props.contact.is_group === false && getImage(props.contact).data === "") ?
                        <img key={props.contact?.group_pic_id || props.contact?.contact_id}  src={`./userProfile2.png`} className="w-14 h-14 rounded-full"></img> :
                     (props.contact !== null && props.contact.is_group === true && props.contact.group_pic_id !== null) ? 
                        <img key={props.contact?.group_pic_id || props.contact?.contact_id}  src={`${getImage(props.contact).data}`} className="w-14 h-14 rounded-full"></img> :
                        (props.contact !== null && props.contact.is_group === true && props.contact.group_pic_id === null) ? 
                        <img key={props.contact?.group_pic_id || props.contact?.contact_id}  src={`./userProfile2.png`} className="w-14 h-14 rounded-full"></img> : <></>                        
                    }
                </div>
                {props.contact !== null && props.contact.is_group === true &&
                    <div className={`relative flex w-[85%] h-[100%] flex-col`}>
                        <div className="relative flex justify-start items-end h-[50%] w-full indent-[20px]">
                            {props.contact !== null && <div className="top-0 flex flex-col text-xl font-semibold">{getNameContact(props.contact)}</div>}
                        </div>
                        <div className={`flex flex-row justify-start h-[50%] w-full indent-[20px]`}>
                            {props.contact !== null && props.contact.members.map((ctc, idx) => (
                                idx === props.contact.members.length - 1 ? `${getUserWithId(ctc).username} ` : `${getUserWithId(ctc).username}, `
                            ))}
                        </div>
                </div>}
                {props.contact !== null && props.contact.is_group === false && 
                    <div className="flex flex-row indent-[20px] w-[90%] h-[100%]">
                        {props.contact !== null && <div className={`top-0 flex flex-row items-center text-xl font-semibold indent-[10px] 
                                                        `}>{getNameContact(props.contact)}</div>}
                    </div>
                }
            </div>
            <div className="relative left-[5%] top-[18%] w-[90%] h-[68%] bg-transparent bg-opacity-50 flex flex-col gap-1 overflow-y-auto">
                {allMessages.length > 0 &&
                    allMessages.map((message, idx) => {
                        // console.log("message =", message);

                        // Helper function to get date label
                        const getDateLabel = (timestamp: string) => {
                            const messageDate = new Date(timestamp);
                            const today = new Date();
                            const yesterday = new Date(today);
                            yesterday.setDate(yesterday.getDate() - 1);
                            
                            // Reset time to compare only dates
                            const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
                            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                            const yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                            
                            if (messageDateOnly.getTime() === todayDateOnly.getTime()) {
                                return "Today";
                            } else if (messageDateOnly.getTime() === yesterdayDateOnly.getTime()) {
                                return "Yesterday";
                            } else {
                                return messageDate.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                });
                            }
                        };
                        
                        // Check if we need to show a date divider
                        const showDateDivider = idx === 0 || 
                            (idx > 0 && 
                            new Date(message.timestamp).toDateString() !== 
                            new Date(allMessages[idx - 1].timestamp).toDateString());

                        return (
                <div key={idx} className={`${props.fontChosen === 'Sans' ? 'font-sans' : props.fontChosen === 'Serif' ? 'font-serif' : 'font-mono'}`}>
                    {/* Date Divider */}
                    {showDateDivider && (
                        <div className="flex justify-center items-center my-2">
                            <div className="bg-gray-500 text-white-700 text-sm font-semibold py-1 px-3 rounded-xl">
                                {getDateLabel(message.timestamp)}
                            </div>
                        </div>
                    )}
                    
                    {/* Message */}
                    {(message.hasOwnProperty('recipient_id') && Object.keys(message.message).length > 0) ? (
                        <div className={`flex ${String(props.curr_user) === String(message.sender_id) ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`inline-flex mt-1 max-w-[80%] py-2 px-4 rounded-lg border-2 border-black flex-col ${
                                    String(props.curr_user) === String(message.sender_id)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-blue-600 text-white'
                                }`}
                            >
                                <div className={`relative flex w-full text-base text-black font-semibold`}>{getUserFromId(message.sender_id).username}</div>
                                <div className="relative flex flex-col gap-2 items-start">
                                    <div className="break-words">
                                        { message.message.hasOwnProperty("image_id") ? <img src={`data:image/jpeg;base64,${findImageBasedOnID(message.message).data}`} className="w-[300px] h-[300px]"  ></img> : 
                                        isBase64(message.message) ? <img src={`data:image/jpeg;base64,${message.message}`} className="w-[300px] h-[300px]"  ></img> :
                                        message.message}
                                    </div>
                                    <div className="text-xs whitespace-nowrap self-end">
                                        {message.timestamp.split("T")[1].split(".")[0].slice(0, 5)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (message.hasOwnProperty('group_id') && Object.keys(message.message).length > 0) ? (
                        <div className={`flex ${String(props.curr_user) === String(message.sender_id) ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`inline-flex mt-1 max-w-[80%] py-2 px-4 rounded-lg border-2 border-black flex-col ${
                                    String(props.curr_user) === String(message.sender_id)
                                        ? 'bg-green-500 text-white bg-opacity-80'
                                        : 'bg-blue-600 text-white'
                                }`}
                            >
                                <div className={`relative flex w-full text-xs text-black ${props.fontChosen === 'Sans' ? 'font-sans' : props.fontChosen === 'Serif' ? 'font-serif' : 'font-mono'}`}>{getUserFromId(message.sender_id).username}</div>
                                <div className="relative flex flex-col gap-1 items-start">
                                    <div className="break-words">
                                        { message.message.hasOwnProperty("image_id") ? <img src={`data:image/jpeg;base64,${findImageBasedOnID(message.message).data}`} className="w-[300px] h-[300px]"  ></img> : 
                                        isBase64(message.message) ? <img src={`data:image/jpeg;base64,${message.message}`} className="w-[300px] h-[300px]"  ></img> :
                                        message.message}
                                    </div>
                                    <div className="text-xs whitespace-nowrap self-end">
                                        {message.timestamp.split("T")[1].split(".")[0].slice(0, 5)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : <></>}
                </div>
            );
                    })}
            </div>
            <div className="absolute left-[2%] top-[88%] w-[96%] h-[10%] rounded-2xl border-[#80ED99] border-2 bg-[#0D1317] flex flex-row">
                <div className="relative left-[0%] flex basis-[8%] top-[15%] h-[70%] hover:bg-gray-500 ml-2 rounded-2xl" >
                    {/* Wrapper for Image and Input */}
                    <div className="relative flex items-center justify-center w-full h-full">
                        <img
                            src="/attach2-1.png"
                            className="h-[50%] aspect-square hover:bg-slate-500 cursor-pointer z-0"
                            alt="Upload"
                            // onClick={() => document.getElementById('fileInput').click()} // Manually trigger input
                        />
                        <input 
                            type="file" accept="image/*"
                            className="absolute top-0 left-0 w-full z-10 h-full opacity-0 cursor-pointer"
                            // onClick={(event) => {
                            //     event.preventDefault();
                            // }}
                            onChange={(event) => {
                                console.log("File input triggered");
                                const file = event.target.files[0];
                                if (file) {
                                    console.log("File selected:", file.name);
                                    const reader = new FileReader();
                                    // console.log("FileReader created");
                                    reader.onload = (e) => {
                                        // console.log("File loaded");
                                        let base64Image = e.target.result as string;
                                        const base64Regex = /^data:image\/[a-zA-Z]+;base64,/;
                                        if (base64Regex.test(base64Image)) {
                                            // Remove the data URL prefix
                                            base64Image = base64Image.replace(base64Regex, '');
                                        }

                                        console.log("Base64 Image (stripped):", base64Image);
                                        
                                        // Send the base64 image
                                        if(props.contact.is_group === true) handleSendMessage2(base64Image)
                                        handleSendMessage(base64Image);
                                    };
                                    reader.onerror = (error) => console.error("Error reading file:", error);
                                    reader.readAsDataURL(file);
                                    console.log("Started reading file");
                                } else {
                                    console.log("No file selected");
                                }
                                // Reset the file input to allow re-selection
                                event.target.value = '';
                            }}
                        />
                    </div>
                </div>
                <div className="relative left-0 flex basis-[80%] h-full">
                    <input type="text" value={text} onChange={(e) => {setText(e.target.value)}} className={`absolute left-0 w-full h-full outline-none bg-transparent indent-4 overflow-auto text-white text-xl
                                                                                                            ${props.fontChosen === 'Sans' ? 'font-sans' : props.fontChosen === 'Serif' ? 'font-serif' : 'font-mono'}`} 
                        onKeyDown={(e) => { 
                            if(e.key === "Enter") {
                                if(props.contact.is_group === true) handleSendMessage2(text)
                                else handleSendMessage(text); 
                                setText("")}}}></input>
                </div>
                <div className="relative left-0 flex flex-row basis-[10%] items-center justify-center " >
                    <div className="absolute flex top-[15%] h-[70%] items-center justify-center rounded-2xl mr-2 w-full hover:bg-slate-500" onClick={() => {handleSendMessage(text); setText("")}}>
                        <img src="/sendIcon3-1.png" className="h-[50%] max-w-[60%]"></img>
                    </div>
                </div>
            </div>
        </div>
    );
}