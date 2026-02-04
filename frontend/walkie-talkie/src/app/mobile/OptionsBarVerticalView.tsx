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
        <div className={`absolute left-0 top-[90%] w-full h-[10%] ${props.themeChosen === "Dark" ? "bg-gray-900/95 border-gray-700/30" : "bg-gray-200 border-t border-gray-300/50"} backdrop-blur-lg shadow-2xl flex flex-col`}>
            <div className="relative flex flex-row top-0 left-0 h-full w-full justify-center items-center">
                <div className="relative flex flex-col h-full w-[30%]">
                    <div className="w-full top-0 h-full relative flex flex-col items-center justify-center" onClick={() => {
                            props.setPressProfile(false);
                            props.setPressedSettings(false);
                            props.setPressProfile(false);
                            props.setProfilePicPrivPress(false);
                            props.setStatusPrivPress(false);
                            props.setPressPrivacy(false);
                            props.setDisappearingMessagesPressed(false);
                            props.setBlockedContactsPressed(false);
                            props.setPressNotifications(false);
                            props.setPressAppearance(false);
                            props.setProfileInfo(false);
                            props.setCurrContact(null);
                        }}>
                        <div className={`flex w-12 h-12 justify-center items-center flex-col rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}>
                            <img src={`${props.themeChosen === "Dark" ? "/messagesIcon_w.png" : "messagesIcon.png"}`} className="flex w-8 h-8 opacity-90"></img>
                        </div>
                    </div>
                </div>
                <div className="relative flex flex-col h-full w-[30%]">
                    <div className="w-full top-0 h-full relative flex flex-col items-center justify-center" onClick={() => {
                            props.setPressProfile(false);
                            props.setPressedSettings(true);
                            props.setPressProfile(false);
                            props.setProfilePicPrivPress(false);
                            props.setStatusPrivPress(false);
                            props.setPressPrivacy(false);
                            props.setDisappearingMessagesPressed(false);
                            props.setBlockedContactsPressed(false);
                            props.setPressNotifications(false);
                            props.setPressAppearance(false);
                            props.setProfileInfo(false);
                            props.setCurrContact(null);
                        }}>
                        <div className={`flex w-10 h-10 justify-center items-center flex-col rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}>
                            <img src={`${props.themeChosen === "Dark" ? "/cogIcon2.png" : "./cog-black.png"}`} className="flex w-8 h-8 opacity-90"></img>
                        </div>
                    </div>
                </div>
                <div className="relative flex flex-col h-full w-[30%]">
                    <div className="relative flex flex-col w-full top-0 h-full items-center justify-center" onClick={() => {
                            props.setPressProfile(false);
                            props.setPressedSettings(true);
                            props.setPressProfile(true);
                            props.setProfilePicPrivPress(false);
                            props.setStatusPrivPress(false);
                            props.setPressPrivacy(false);
                            props.setDisappearingMessagesPressed(false);
                            props.setBlockedContactsPressed(false);
                            props.setPressNotifications(false);
                            props.setProfileInfo(false);
                            props.setPressAppearance(false);
                            props.setCurrContact(null);
                        }}>
                        <div className={`flex w-10 h-10 justify-center items-center flex-col rounded-xl hover:cursor-pointer transition-all hover:shadow-lg hover:shadow-[#3B7E9B]/30 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}>
                            {imageData.data !== "" ? <img src={`data:image/jpg;base64,${imageData.data}`} className="flex w-8 h-8 rounded-full border-2 border-transparent hover:border-[#3B7E9B] transition-all" onClick={() => {}}></img>
                                                : <img src={`${props.themeChosen === "Dark" ? "./profilePic2.png" : "/profilePic_black.png"}`} className="flex w-8 h-8 rounded-full opacity-90"></img>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}