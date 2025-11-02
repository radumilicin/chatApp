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
                    <img src="/back-arrow.png" className="justify-center items-center max-h-[70%] aspect-square"></img>
                </div>
                <div className="relative indent-[20px] left-[2%] w-[70%] text-xl font-semibold text-white font-sans flex flex-row justify-start items-center">Disappearing messages</div>
            </div>

            <div className="absolute left-0 w-full top-[15%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className="relative flex flex-row h-[6%] left-[6%] w-[96%] text-xl text-[#CBD4E0]">Time after messages disappear</div>
                    <div className="relative flex flex-col left-[6%] w-[88%] h-[40%]">
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setDisappearingMessagesPeriod("Day") }}>
                                    {props.disappearingMessagesPeriod !== "Day" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Day" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Day" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className="relative flex flex-row items-center indent-[5px] w-[90%] h-full">Day</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setDisappearingMessagesPeriod("Week") }}>
                                    {props.disappearingMessagesPeriod !== "Week" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Week" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Week" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className="relative flex flex-row items-center indent-[5px] w-[90%] h-full">Week</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setDisappearingMessagesPeriod("Month") }}>
                                    {props.disappearingMessagesPeriod !== "Month" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Month" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Month" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className="relative flex flex-row items-center indent-[5px] w-[90%] h-full">Month</div>
                        </div>
                        <div className="relative flex flex-row w-full h-[20%]">
                            <div className="relative flex flex-row justify-center items-center w-[10%] h-full">
                                <div className="relative flex flex-row justify-center items-center w-6 h-6 hover:cursor-pointer" onClick={() => { props.setDisappearingMessagesPeriod("Off") }}>
                                    {props.disappearingMessagesPeriod !== "Off" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Off" && <div className="absolute flex flex-row w-3 h-3 bg-green-700 rounded-full"></div>}
                                    {props.disappearingMessagesPeriod === "Off" && <div className="absolute flex flex-row w-6 h-6 bg-transparent border-[3px] border-green-700 rounded-full"></div>}
                                </div>
                            </div>
                            <div className="relative flex flex-row items-center indent-[5px] w-[90%] h-full">Off</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}