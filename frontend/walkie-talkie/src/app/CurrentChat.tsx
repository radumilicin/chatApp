import { useEffect, useRef, useState } from 'react';
import useWebSocket from './webSocket';

export default function CurrentChat( props: any ) {

    const { messages, isConnected, sendMessage } = useWebSocket('ws://localhost:8080');
    const [text, setText] = useState('');
    const prevMessages = useRef(messages)
    const [allMessages, updateAllMessages] = useState([])
    const [contact, setContact] = useState(null)

    // gets all messages already existing in the DB
    useEffect(() => {
        setContact(props.contact)
        if(props.contact !== null)
            updateAllMessages(props.contact.message)
    }, [props.contact])

    useEffect(() => {
        const currMessages = [...allMessages]
        const messagesNotYetReceived = messages.slice(messages.length - prevMessages.current.length, messages.length)
        updateAllMessages([...currMessages, ...messagesNotYetReceived])
    }, [messages])


    const handleSendMessage = () => {
        if (text.trim() === '') return;

        const message = {
            user_id: props.curr_user, // Replace with dynamic user ID
            recipient_id: props.contact.contact_id, // Replace with dynamic recipient ID
            message: text,
            timestamp: new Date().toISOString(),
        };

        sendMessage(message);
        updateAllMessages([...allMessages, message])
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

    return (
        <div className="relative top-[10%] left-[10%] w-[50%] h-[80%] rounded-lg bg-[#7DD8C3] border-white border-[3px]">
            <div className="absolute left-0 top-0 w-[100%] h-[15%] rounded-t-lg border-white border-b-2 bg-gray-500 bg-opacity-50 flex flex-row">
                <div className="flex w-[15%] h-[100%] justify-center items-center">
                    {contact !== null && <img src={`data:image/jpg;base64,${getImage(contact).data}`} className="max-h-[60%] rounded-full"></img>}
                </div>
                <div className="flex w-[85%] h-[100%] items-center">
                    {contact !== null && <div className="top-0 flex flex-col text-2xl font-semibold">{getUser(contact).username}</div>}
                </div>
            </div>
            <div className="relative left-[5%] top-[18%] w-[90%] h-[68%] bg-transparent bg-opacity-50 flex flex-col gap-1 border-2 border-black overflow-scroll">
                {allMessages.length > 0 && allMessages.map((message, idx) => {return (
                    Object.keys(message).length > 0 && <div key={idx} className={`inline-block mt-1 max-w-[80%] py-2 px-4 rounded-lg border-2 border-black ${
                    props.curr_user === message.user_id ? 'bg-green-400 text-white' : 'bg-blue-500 text-white'
                }`}
                style={{
                    marginLeft: props.curr_user === message.user_id ? 'auto' : 'unset',
                    marginRight: props.curr_user === message.user_id ? 'unset' : 'auto',
                }}>{message.message}</div>
                )})}
            </div>
            <div className="absolute left-[2%] top-[88%] w-[96%] h-[10%] rounded-2xl border-white border-2 bg-gray-500 bg-opacity-50 flex flex-row">
                <div className="relative left-0 flex basis-[90%] h-full">
                    <input type="text" value={text} onChange={(e) => {setText(e.target.value)}}className="absolute left-0 w-full h-full outline-none bg-transparent indent-4 overflow-auto text-white" 
                        onKeyDown={(e) => { if(e.key === "Enter") {handleSendMessage(); setText("")}}}></input>
                </div>
                <div className="relative left-0 flex basis-[10%] items-center right-2">
                    <img src="/send.png" className="max-h-[50%]"></img>
                </div>
            </div>
        </div>
    );
}