import react, {useState, useEffect} from 'react';


export default function OptionsBar(props){
    return (    
        <div className={`absolute left-[3%] top-[5%] w-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-[#0D1317]" : "bg-gray-300 border-gray-400 shadow-lg border-[1px]"} rounded-l-xl flex flex-col`}>  
            <div className="relative flex flex-col h-[50%] w-full">
                <div className="w-full top-0 h-[20%] relative flex flex-col items-center justify-center" onClick={() => {props.setPressProfile(false); props.setPressedSettings(false)}}>
                    <div className={`flex w-[70%] h-[70%] justify-center items-center flex-col ${props.themeChosen === "Light" ? "hover:bg-opacity-60" : ""} hover:bg-gray-500 rounded-2xl hover:cursor-pointer`}>
                        <img src={`${props.themeChosen === "Dark" ? "/messageIcon2.png" : "messageIconBlack-nobg.png"}`} className="flex w-full h-full rounded-full"></img>
                    </div>
                </div>
            </div>
            <Settings curr_user={props.curr_user} users={props.users} images={props.images} setPressProfile={props.setPressProfile} 
                      pressedSettings={props.pressedSettings} setPressedSettings={props.setPressedSettings} themeChosen={props.themeChosen}></Settings>
        </div>
    );
}

export function Settings(props) {

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
        <div className="relative flex flex-col h-[50%] rounded-bl-2xl w-full">
            <div className="w-full h-[20%] top-[60%] relative flex flex-col items-center justify-center">
                <div className={`flex w-[70%] h-[70%] justify-center items-center flex-col hover:bg-gray-500 ${props.themeChosen === "Light" ? "hover:bg-opacity-60" : ""} rounded-2xl hover:cursor-pointer`}>
                    <img src={`${props.themeChosen === "Dark" ? "./cogIcon2.png" : "cog-black.png"}`} className="flex w-[70%] h-[70%]" onClick={() => { 
                                                                                               if(props.pressedSettings) props.setPressedSettings(false)
                                                                                               else props.setPressedSettings(true)         
                                                                                             }
                                                                                      }></img>
                </div>
            </div>
            <div className="w-full h-[20%] top-[60%] hover:rounded-bl-xl relative flex flex-col items-center justify-center hover:cursor-pointer" onClick={() => {props.setPressProfile(true)}}>
                <div className={`flex w-[70%] h-[70%] justify-center items-center flex-col hover:bg-gray-500 ${props.themeChosen === "Light" ? "hover:bg-opacity-60" : ""} rounded-2xl`}>
                {imageData.data !== "" ? <img src={`data:image/jpg;base64,${imageData.data}`} className="flex w-[70%] h-[70%] hover:bg-gray-500 rounded-full" onClick={() => {}}></img>
                                               : <img src="./profilePic2.png" className="flex w-[70%] h-[70%] hover:bg-gray-500 rounded-full"></img>
                }
                </div>
            </div>
        </div>
    );    
}