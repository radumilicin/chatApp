

export default function CurrentChat( props: any ) {

    function getImage(contact: any) {
        const image = props.images.find((image: any) => image.user_id === contact.contact_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    function getUser(contact: any) {
        const user = props.users.find((user: any) => user.id === contact.contact_id);
        return user || { data: "" }; // Ensure we return a fallback value
    }

    return (
        <div className="relative top-[10%] left-[10%] w-[50%] h-[80%] rounded-lg bg-[#7DD8C3] border-white border-[3px]">
            <div className="absolute left-0 top-0 w-[100%] h-[15%] rounded-t-lg border-white border-b-2 bg-gray-500 bg-opacity-50 flex flex-row">
                <div className="flex w-[15%] h-[100%] justify-center items-center">
                    {props.contact !== null && <img src={`data:image/jpg;base64,${getImage(props.contact).data}`} className="max-h-[60%] rounded-full"></img>}
                </div>
                <div className="flex w-[85%] h-[100%] items-center">
                    {props.contact !== null && <div className="top-0 flex flex-col text-2xl font-semibold">{getUser(props.contact).username}</div>}
                </div>
            </div>
        
            <div className="absolute left-[2%] top-[88%] w-[96%] h-[10%] rounded-2xl border-white border-2 bg-gray-500 bg-opacity-50 flex flex-row">
                <div className="relative left-0 flex basis-[90%] h-full">
                    <input className="absolute left-0 w-full h-full outline-none bg-transparent indent-4 overflow-auto text-white"></input>
                </div>
                <div className="relative left-0 flex basis-[10%] items-center right-2">
                    <img src="/send.png" className="max-h-[50%]"></img>
                </div>
            </div>
        </div>
    );
}