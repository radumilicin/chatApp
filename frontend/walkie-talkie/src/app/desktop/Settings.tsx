import react, {useState, useEffect} from 'react';


export default function OptionsBar(props){
    return (
        <div className={`shrink-0 w-[5%] min-w-[60px] max-w-[80%] h-full ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            <div className="relative flex flex-col h-[50%] w-full">
                <div className="w-full top-0 h-[20%] relative flex flex-col items-center justify-center" onClick={() => {props.setPressProfile(false); props.setPressedSettings(false)}}>
                    <div className={`flex w-[70%] h-[70%] justify-center items-center flex-col rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}>
                        <img src={`${props.themeChosen === "Dark" ? "/messagesIcon_w.png" : "messagesIcon.png"}`} className="flex w-[20px] h-[20px] md:w-[24px] md:h-[24px] xl:w-[28px] xl:h-[28px] 2xl:w-8 2xl:h-8 opacity-90"></img>
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
        <div className="relative flex flex-col h-[50%] rounded-bl-2xl w-full min-w-[50px]">
            <div className="w-full h-[20%] top-[60%] relative flex flex-col items-center justify-center">
                <div
                    className={`group flex w-[70%] h-[70%] justify-center items-center flex-col rounded-xl hover:cursor-pointer transition-all
                    ${props.themeChosen === "Dark"
                    ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30"
                    : "hover:bg-gray-300/50"}
                    hover:scale-105 active:scale-95`}
                >
                    <img
                    src={props.themeChosen === "Dark" ? "./cogIcon2.png" : "cog-black.png"}
                    className="w-4 h-4 md:w-[32px] md:h-[32px] xl:w-[36px] xl:h-[36px] 2xl:w-10 2xl:h-10
                                opacity-90 transition-transform duration-300 group-hover:rotate-45"
                    onClick={() => props.setPressedSettings(!props.pressedSettings)}
                    />
                </div>
            </div>

            <div className="w-full h-[20%] top-[60%] relative flex flex-col items-center justify-center hover:cursor-pointer" onClick={() => {props.setPressProfile(true)}}>
                <div className={`flex w-[70%] h-[70%] justify-center items-center flex-col rounded-xl transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}>
                {imageData.data !== "" ? <img src={`data:image/jpg;base64,${imageData.data}`} className="flex w-[40px] h-[40px] rounded-full border-2 border-transparent hover:border-[#3B7E9B] transition-all" onClick={() => {}}></img>
                                               : <img src={`${props.themeChosen === "Dark" ? "./profilePic2.png" : "./profilePic_black.png"}`} className="flex w-[40px] h-[40px] rounded-full opacity-90"></img>
                }
                </div>
            </div>
        </div>
    );    
}