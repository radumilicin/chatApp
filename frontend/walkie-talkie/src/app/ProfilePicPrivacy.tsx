import {useState, useEffect, useRef} from 'react'

export default function ProfilePicPrivacy(props: any) {

    const first = useRef(false)

    useEffect(() => {
        if(!first.current) {
            first.current = true
            return
        }

        changeVisibilityProfilePic()
    }, [props.visibilityProfilePic])

    useEffect(() => {
        if(props.userObj !== null) props.setVisibilityProfilePic(props.userObj.profile_pic_visibility)
        else props.setVisibilityProfilePic("Everyone")
    }, [props.userObj])

    async function changeVisibilityProfilePic() {

        const data = {
            'user': props.user,
            'new_visibility': props.visibilityProfilePic
        }

        const resp = await fetch("http://localhost:3002/changeProfilePicVisibility", {
            method: 'PUT',
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        if(resp.ok){
            console.log("Visibility changed successfuly in the server")
            props.fetchUsers()
        } else {
            console.error("Error could not update ")
        }
    }

    return (
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-[#323232] bg-opacity-60 border-[#0D1317] " : "bg-gray-300 border-gray-400 shadow-lg border-2"} border-black border-2 flex flex-col`}>
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className={`relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl hover:cursor-pointer`} 
                        onClick={() => {
                            props.setPressPrivacy(true)
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(false)
                            props.setProfilePicPrivPress(false)
                            props.setStatusPrivPress(false)
                            props.setDisappearingMessagesPressed(false)
                            props.setBlockedContactsPressed(false)
                        }}>
                    <img src={`${props.themeChosen === "Dark" ? "/back-arrow.png" : "back_image_black.png"}`} className="justify-center items-center max-h-[70%] aspect-square"></img>
                </div>
                <div className={`relative indent-[10px] left-[2%] w-[90%] text-base lg:text-lg xl:text-xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-sans flex flex-row justify-start items-center`}>Profile Picture Privacy</div>
            </div>

            <div className="absolute left-0 w-full top-[15%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className={`relative flex flex-row h-[6%] left-[6%] w-[96%] text-sm lg:text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-[#CBD4E0]" : "text-black"}`}>Who can see your profile picture:</div>
                    <div className="relative flex flex-col left-[6%] w-[88%] h-[40%]">
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setVisibilityProfilePic("Everyone") }}>
                                    {props.visibilityProfilePic !== "Everyone" && <div className="absolute flex flex-row w-4 h-4 xl:w-5 xl:h-5 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.visibilityProfilePic === "Everyone" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-700 rounded-full"></div>}
                                    {props.visibilityProfilePic === "Everyone" && <div className="absolute flex flex-row w-4 h-4 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full text-sm lg:text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-[#CBD4E0]" : "text-black"}`}>Everyone</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setVisibilityProfilePic("Contacts") }}>
                                    {props.visibilityProfilePic !== "Contacts" && <div className="absolute flex flex-row w-4 h-4 xl:w-5 xl:h-5 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.visibilityProfilePic === "Contacts" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-700 rounded-full"></div>}
                                    {props.visibilityProfilePic === "Contacts" && <div className="absolute flex flex-row w-4 h-4 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full text-sm lg:text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-[#CBD4E0]" : "text-black"}`}>Contacts</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setVisibilityProfilePic("Nobody") }}>
                                    {props.visibilityProfilePic !== "Nobody" && <div className="absolute flex flex-row w-4 h-4 xl:w-5 xl:h-5 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.visibilityProfilePic === "Nobody" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-700 rounded-full"></div>}
                                    {props.visibilityProfilePic === "Nobody" && <div className="absolute flex flex-row w-4 h-4 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full text-sm lg:text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-[#CBD4E0]" : "text-black"}`}>Nobody</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}