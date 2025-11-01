import {useState, useEffect, useRef} from 'react'

export default function StatusPrivacy(props: any) {

    const first = useRef(false)

    useEffect(() => {
        if(!first.current) {
            first.current = true
            return
        }

        changeVisibilityStatus()
    }, [props.visibilityStatus])

    useEffect(() => {
    if(props.userObj !== null) props.setVisibilityStatus(props.userObj.profile_pic_visibility)
        else props.setVisibilityStatus("Everyone")
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
        } else {
            console.error("Error could not update ")
        }
    }

    return (
        <div className="relative left-[8%] w-[30%] top-[5%] h-[90%] bg-[#637081] border-black border-2 flex flex-col bg-opacity-70">
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className="relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-slate-400 hover:rounded-xl hover:cursor-pointer" 
                        onClick={() => {
                            props.setPressPrivacy(true)
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(false)
                            props.setProfilePicPrivPress(false)
                            props.setStatusPrivPrev(false)
                            props.setDisappearingMessagesPressed(false)
                        }}>
                    <img src="/back-arrow.png" className="justify-center items-center max-h-[70%] aspect-square"></img>
                </div>
                <div className="relative indent-[20px] left-[2%] w-[70%] text-xl font-semibold text-white font-sans flex flex-row justify-start items-center">Status privacy</div>
            </div>

            <div className="absolute left-0 w-full top-[15%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className="relative flex flex-row h-[6%] left-[6%] w-[96%] text-xl text-[#CBD4E0]">Who can see your status:</div>
                    <div className="relative flex flex-col left-[6%] w-[88%] h-[40%]">
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setVisibilityStatus("Everyone") }}>
                                    {props.visibilityStatus !== "Everyone" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Everyone" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Everyone" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className="relative flex flex-row items-center indent-[5px] w-[90%] h-full">Everyone</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setVisibilityStatus("Contacts") }}>
                                    {props.visibilityStatus !== "Contacts" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Contacts" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Contacts" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className="relative flex flex-row items-center indent-[5px] w-[90%] h-full">Contacts</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setVisibilityStatus("Nobody") }}>
                                    {props.visibilityStatus !== "Nobody" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Nobody" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.visibilityStatus === "Nobody" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className="relative flex flex-row items-center indent-[5px] w-[90%] h-full">Nobody</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}