import {useEffect, useState, useRef} from 'react'


export default function DisappearingMessagesView(props: any) {

    const first = useRef(false)

    useEffect(() => {
        if(!first.current) {
            first.current = true
            console.log("disappearingMessages set to: " + props.disappearingMessagesPeriod)
            return
        }

        changeDisappearingMessagesPeriod()
    }, [props.disappearingMessagesPeriod])

    useEffect(() => {
        if(props.userObj !== null) props.setDisappearingMessagesPeriod(props.userObj.disappearing_message_period)
        else props.setDisappearingMessagesPeriod("Off")
    }, [props.userObj])

    async function changeDisappearingMessagesPeriod() {

        const data = {
            'user': props.user,
            'new_period': props.disappearingMessagesPeriod
        }

        console.log("new period for disappearing messages: " + props.disappearingMessagesPeriod)

        const resp = await fetch("http://localhost:3002/changeDisappearingMessagesPeriod", {
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
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg rounded-2xl flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            <div className={`absolute left-0 top-[1%] h-[5%] w-full flex flex-row ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className={`relative left-[2%] w-[8%] text-2xl font-semibold font-sans flex flex-row justify-center items-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                        onClick={() => {
                            props.setPressPrivacy(true)
                            props.setPressedSettings(false)
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
                    <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="justify-center items-center w-6 h-6 aspect-square opacity-90"></img>
                </div>
                <div className={`relative indent-[20px] left-[2%] w-[90%] text-base lg:text-lg xl:text-xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} font-sans flex flex-row justify-start items-center`}>Disappearing messages</div>
            </div>
            <div className={`absolute left-0 w-full top-[6%] h-[9%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}></div>
            <div className={`absolute left-0 w-full top-[15%] h-[85%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className={`relative flex flex-row h-[6%] left-[6%] w-[96%] text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? "text-[#CBD4E0]" : "text-black"} text-[#CBD4E0]`}>Time after messages disappear:</div>
                    <div className="relative flex flex-col left-[6%] w-[88%] h-[40%]">
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setDisappearingMessagesPeriod("Day") }}>
                                    {props.disappearingMessagesPeriod !== "Day" && <div className="absolute flex flex-row w-4 h-4 xl:w-5 xl:h-5 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Day" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Day" && <div className="absolute flex flex-row w-4 h-4 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Day</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setDisappearingMessagesPeriod("Week") }}>
                                    {props.disappearingMessagesPeriod !== "Week" && <div className="absolute flex flex-row w-4 h-4 xl:w-5 xl:h-5 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Week" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Week" && <div className="absolute flex flex-row w-4 h-4 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Week</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setDisappearingMessagesPeriod("Month") }}>
                                     {props.disappearingMessagesPeriod !== "Month" && <div className="absolute flex flex-row w-4 h-4 xl:w-5 xl:h-5 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Month" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Month" && <div className="absolute flex flex-row w-4 h-4 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Month</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setDisappearingMessagesPeriod("Off") }}>
                                     {props.disappearingMessagesPeriod !== "Off" && <div className="absolute flex flex-row w-4 h-4 xl:w-5 xl:h-5 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Off" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Off" && <div className="absolute flex flex-row w-4 h-4 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className={`relative flex flex-row items-center indent-[5px] w-[90%] h-full ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Off</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}