import {useEffect, useState} from 'react';


export default function OptionsBarVerticalView(props){

    const [imageData, setImageData] = useState({'data' : ""}) 

    // type user is either current or other (0,1)
    function getProfileImage() {
        const user = props.users.find((user) => {
            return user.id === props.curr_user
        })
        const image = props.images.find((image: any) => image.id === user.profile_pic_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    useEffect(() => {
        setImageData(getProfileImage())
    }, [props.users, props.images])

    return (    
        <div className={`absolute left-0 top-[90%] w-full h-[10%] ${props.themeChosen === "Dark" ? "bg-[#0D1317]" : "bg-gray-300 border-gray-400 shadow-lg border-[1px]"} flex flex-col`}>  
            <div className="relative flex flex-row top-0 left-0 h-full w-full justify-center items-center">
                <div className="relative flex flex-col h-full w-[30%]">
                    <div className="w-full top-0 h-full relative flex flex-col items-center justify-center" onClick={() => {props.setPressProfile(false); props.setPressedSettings(false)}}>
                        <div className={`flex w-12 h-12 justify-center items-center flex-col hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:cursor-pointer`}>
                            <img src={`${props.themeChosen === "Dark" ? "/message-icon-white2.png" : "message-icon-black2.png"}`} className="flex w-6 h-6"></img>
                        </div>
                    </div>
                </div>
                <div className="relative flex flex-col h-full w-[30%]">
                    <div className="w-full top-0 h-full relative flex flex-col items-center justify-center" onClick={() => {props.setPressProfile(false); props.setPressedSettings(false)}}>
                        <div className={`flex w-15 h-15 justify-center items-center flex-col hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} rounded-md hover:cursor-pointer`}>
                            <img src={`${props.themeChosen === "Dark" ? "/cogIcon2.png" : "./cog-black.png"}`} className="flex w-8 h-8 rounded-md"></img>
                        </div>
                    </div>
                </div>
                <div className="relative flex flex-col h-full w-[30%]">
                    <div className="relative flex flex-col w-full top-0 h-full items-center justify-center" onClick={() => {props.setPressProfile(false); props.setPressedSettings(false)}}>
                        <div className={`flex w-12 h-12 justify-center items-center flex-col hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:cursor-pointer`}>
                            {imageData.data !== "" ? <img src={`data:image/jpg;base64,${imageData.data}`} className="flex w-8 h-8 hover:bg-gray-500 rounded-full" onClick={() => {}}></img>
                                                : <img src="./profilePic2.png" className="flex w-8 h-8 hover:bg-gray-500 rounded-full"></img>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}