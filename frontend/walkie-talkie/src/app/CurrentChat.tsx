import { useEffect, useRef, useState } from 'react';
import useWebSocket from './webSocket';
import fs from "fs";

export default function CurrentChat( props: any ) {

    const [ messages, setMessages] = useState([]); // Store received messages
    const { isConnected, sendMessage } = useWebSocket(`ws://localhost:8080?userId=${props.curr_user}`, setMessages);
    const [text, setText] = useState('');
    const prevMessages = useRef(messages)
    const [allMessages, updateAllMessages] = useState([])
    const allMessagesPrev = useRef(allMessages)
    const contact = useRef(null)

    async function updateList(allMessages, newMessages: any[]){
        var elems = []
        for (const elem of newMessages) {
            // Assuming `message` is the unique key in each element
            if (!allMessages.some((msg) => msg.timestamp === elem.timestamp)) {
                console.log("new message: " + JSON.stringify(elem.message))
                elems.push(elem);
            }
        }
        updateAllMessages((prev) => {
            const updatedMessages = [...prev, ...elems];
            allMessagesPrev.current = updatedMessages; // Update the reference
            return updatedMessages;
        });
        setMessages([]);
    }

    //gets all messages already existing in the DB
    useEffect(() => {
        // if(props.contact !== null){
        if(props.contact !== contact.current){
            console.log("NEW CONTACT = " + props.contact.contact_id)
            const emptyMessages = async () => {
                updateAllMessages(() => [])
                console.log("messages after emptying = " + JSON.stringify(allMessages))
            }
            emptyMessages()
            prevMessages.current = []

            console.log("props.contact in if = " + props.contact.contact_id)
            const fetchMessages = async () => {
                const response = await fetch(`http://localhost:3002/contacts?user=${props.curr_user}&contact_id=${props.contact.contact_id}`); // Replace with your API endpoint
                // console.log("response = " + JSON.stringify(response))
                const result = await response.json();
                console.log("result = " + JSON.stringify(result) + "  \n\nmessage: " + JSON.stringify(result[0]?.message) + "\n\n")
                await updateList(allMessages, result[0]?.message)
                console.log("allMessages after changing contact = " + JSON.stringify(allMessages));
            };
            fetchMessages()

            const updateContactAndMessages = async () => {
                // setContact(props.contact)
                setMessages([])
            }
            updateContactAndMessages()

            console.log("props.contact = " + props.contact)
        }
        contact.current = props.contact
        // }

        // if(props.contact !== null)
        //     updateAllMessages(props.contact.message)
    }, [props.contact])

    useEffect(() => {
        if(props.contact === contact.current) {  // this only happens when the contact user stays the same
            if(props.contact !== null) console.log("is this triggering? Contact = " + props.contact.contact_id)
            const currMessages = [...allMessages]
            const messagesNotYetReceived = messages.slice(messages.length - prevMessages.current.length, messages.length)
            
            var ls = []
            // const initial_length = messagesNotYetReceived.length
            for(var i = messagesNotYetReceived.length - 1 ; i > -1 ; i--){
                if(messagesNotYetReceived[i].hasOwnProperty('message') && messagesNotYetReceived[i].hasOwnProperty('status')) {
                   messagesNotYetReceived.splice(i, 1)
                }
            }

            updateAllMessages([...currMessages, ...messagesNotYetReceived])
            prevMessages.current = allMessages

            console.log("allMessages in messages = " + JSON.stringify(allMessages))
        }
    }, [messages])


    const handleSendMessage = (msg) => {
        if (msg.trim() === '') return;

        const message = {
            user_id: props.curr_user, // Replace with dynamic user ID
            recipient_id: props.contact.contact_id, // Replace with dynamic recipient ID
            message: msg,
            timestamp: new Date().toISOString(),
        };

        sendMessage(message);
        if(allMessages.length === 0) {
            console.log("why is this triggering now?")
            updateAllMessages([message])    
        }
        else {
            console.log("allMessages" + JSON.stringify(allMessages))
            updateAllMessages([...allMessages, message])
        }
        setText(''); // Clear input
    };

    function getImage(contact: any) {
        const image = props.images.find((image: any) => image.user_id === props.contact.contact_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    function getUser(contact: any) {
        const user = props.users.find((user: any) => user.id === props.contact.contact_id);
        return user || { data: "" }; // Ensure we return a fallback value
    }

    const isBase64 = value => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value);

    const findImageBasedOnId = (message: any) => {
        console.log("message = " + JSON.stringify(message))
        const image = props.images.find((img) => { return img.id === message.image_id})
        console.log("image =" + JSON.stringify(image))
        return image
    }

    return (
        <div className="relative top-[5%] left-[10%] w-[50%] h-[90%] rounded-lg bg-[#7DD8C3] border-[3px]">
            <div className="absolute left-0 top-0 w-[100%] h-[15%] rounded-t-lg border-b-2 bg-gray-500 bg-opacity-50 flex flex-row">
                <div className="flex w-[15%] h-[100%] justify-center items-center">
                    {contact.current !== null && <img src={`data:image/jpg;base64,${getImage(contact.current).data}`} className="max-h-[60%] rounded-full"></img>}
                </div>
                <div className="flex w-[85%] h-[100%] items-center">
                    {contact.current !== null && <div className="top-0 flex flex-col text-2xl font-semibold">{getUser(contact.current).username}</div>}
                </div>
            </div>
            <div className="relative left-[5%] top-[18%] w-[90%] h-[68%] bg-transparent bg-opacity-50 flex flex-col gap-1 overflow-y-auto">
                {allMessages.length > 0 &&
                    allMessages.map((message, idx) => {
                        console.log("message =", message);
                        return (
                            Object.keys(message.message).length > 0 && (
                                <div
                                    key={idx}
                                    className={`flex mt-1 max-w-[80%] py-2 px-4 rounded-lg border-2 border-black flex-row ${
                                        String(props.curr_user) === String(message.user_id)
                                            ? 'bg-green-400 text-white mr-auto'
                                            : 'bg-blue-500 text-white ml-auto'
                                    }`}
                                >
                                    {/* Message Text */}
                                    <div className="w-[80%] break-words px-3">
                                        { message.message.hasOwnProperty("image_id") ? <img src={`data:image/jpeg;base64,${findImageBasedOnId(message.message).data}`} className="w-[300px] h-[300px]"  ></img> : 
                                          isBase64(message.message) ? <img src={`data:image/jpeg;base64,${message.message}`} className="w-[300px] h-[300px]"  ></img> :
                                        message.message}
                                    </div>
                                    {/* Timestamp */}
                                    <div
                                        className="relative flex flex-col top-[6px] left-[6px] w-[20%] h-full items-end justify-end text-xs"
                                        // style={{
                                        //     marginBottom: '4px', // Small margin from the bottom
                                        // }}
                                    >
                                        {message.timestamp.split("T")[1].split(".")[0].slice(0, 5)}
                                    </div>
                                </div>
                            )
                        );
                    })}
            </div>
            <div className="absolute left-[2%] top-[88%] w-[96%] h-[10%] rounded-2xl border-white border-2 bg-gray-500 bg-opacity-50 flex flex-row">
                <div className="relative left-[0%] flex basis-[8%] top-[15%] h-[70%] hover:bg-gray-500 ml-2 rounded-2xl" >
                    {/* Wrapper for Image and Input */}
                    <div className="relative flex items-center justify-center w-full h-full">
                        <img
                            src="/attach1.png"
                            className="h-[70%] rounded-2xl hover:bg-slate-500 cursor-pointer z-0"
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
                                    console.log("FileReader created");
                                    reader.onload = (e) => {
                                        console.log("File loaded");
                                        let base64Image = e.target.result as string;
                                        const base64Regex = /^data:image\/[a-zA-Z]+;base64,/;
                                        if (base64Regex.test(base64Image)) {
                                            // Remove the data URL prefix
                                            base64Image = base64Image.replace(base64Regex, '');
                                        }

                                        console.log("Base64 Image (stripped):", base64Image);
                                        
                                        // Send the base64 image
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
                    <input type="text" value={text} onChange={(e) => {setText(e.target.value)}}className="absolute left-0 w-full h-full outline-none bg-transparent indent-4 overflow-auto text-white text-xl" 
                        onKeyDown={(e) => { if(e.key === "Enter") {handleSendMessage(text); setText("")}}}></input>
                </div>
                <div className="relative left-0 flex flex-row basis-[10%] items-center justify-center " >
                    <div className="absolute flex top-[15%] h-[70%] items-center justify-center rounded-2xl mr-2 w-full hover:bg-slate-500" onClick={() => {handleSendMessage(text); setText("")}}>
                        <img src="/sendImg4.png" className="h-[100%] max-w-[80%]"></img>
                    </div>
                </div>
            </div>
        </div>
    );
}