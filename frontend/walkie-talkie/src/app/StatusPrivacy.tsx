import {useState, useEffect, useRef} from 'react'

export default function StatusPrivacy(props: any) {

    const first = useRef(false)
    const prevStatus = useRef("")

    useEffect(() => {
        if(!first.current) {
            first.current = true
            return
        }

        changeVisibilityStatus()
    }, [props.visibilityStatus])

    useEffect(() => {
        if(props.userObj !== null) {
            props.setVisibilityStatus(props.userObj.status_visibility)
            // prevStatus.current = props.visibilityStatus
        }
        else {
            props.setVisibilityStatus("Everyone")
            // prevStatus.current = props.visibilityStatus
        }
    }, [props.userObj])

    async function changeVisibilityStatus() {

        const data = {
            'user': props.user,
            'new_visibility': props.visibilityStatus
        }

        const resp = await fetch("http://localhost:3002/changeStatusVisibility", {
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
            // prevStatus.current = props.visibilityStatus
        } else {
            console.error("Error could not update ")
            // props.setVisibilityStatus(prevStatus.current)
        }
    }

    return (
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-[#323232] bg-opacity-60 border-[#0D1317] " : "bg-gray-300 border-gray-400 shadow-lg border-2"} border-black border-2 flex flex-col`}>
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className={`relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl hover:cursor-pointer`}
                        onClick={() => {
                            props.setPressPrivacy(true)
                            props.setStatusPrivPress(false)
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(false)
                            props.setProfilePicPrivPress(false)
                            props.setDisappearingMessagesPressed(false)
                            props.setBlockedContactsPressed(false)
                        }}>
                    <img src={`${props.themeChosen === "Dark" ? "/back-arrow.png" : "back_image_black.png"}`} className="justify-center items-center max-h-[70%] aspect-square"></img>
                </div>
                <div className={`relative indent-[20px] left-[2%] w-[70%] text-xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-sans flex flex-row justify-start items-center`}>Status privacy</div>
            </div>

            <div className="absolute left-0 w-full top-[15%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className={`relative flex flex-row h-[6%] left-[6%] w-[96%] text-xl ${props.themeChosen === "Dark" ? "text-[#CBD4E0]" : "text-black"}`}>Who can see your status:</div>
                    <div className="relative flex flex-col left-[6%] w-[88%] h-[40%]">
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setVisibilityStatus("Everyone") }}>
                                    {props.visibilityStatus !== "Everyone" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Everyone" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Everyone" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Everyone</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setVisibilityStatus("Contacts") }}>
                                    {props.visibilityStatus !== "Contacts" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Contacts" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Contacts" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Contacts</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setVisibilityStatus("Nobody") }}>
                                    {props.visibilityStatus !== "Nobody" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Nobody" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Nobody" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Nobody</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}