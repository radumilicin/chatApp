import {useEffect, useState, useRef} from 'react'
import { SERVER, PORT_SERVER } from '../config'


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
            'new_setting': props.disappearingMessagesPeriod
        }

        console.log("new period for disappearing messages: " + props.disappearingMessagesPeriod)

        const resp = await fetch(`http://${SERVER}:${PORT_SERVER}/changeDisappearingMessagesPeriod`, {
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
        <div className={`shrink-0 w-[30%] min-w-[400px] h-full ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            {/* Header */}
            <div className="relative w-full pt-4 px-4 pb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
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
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="w-6 h-6 aspect-square opacity-90" alt="Back" />
                    </div>
                    <h1 className={`text-2xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent`}>
                        Disappearing Messages
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex flex-col gap-6">
                    {/* Duration Section */}
                    <div className="flex flex-col gap-3">
                        <h2 className={`text-sm font-semibold uppercase tracking-wide ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Default message duration
                        </h2>
                        <div className="flex flex-col gap-[2px]">
                            <RadioOption
                                label="Day"
                                selected={props.disappearingMessagesPeriod === "Day"}
                                onClick={() => props.setDisappearingMessagesPeriod("Day")}
                                themeChosen={props.themeChosen}
                            />
                            <RadioOption
                                label="Week"
                                selected={props.disappearingMessagesPeriod === "Week"}
                                onClick={() => props.setDisappearingMessagesPeriod("Week")}
                                themeChosen={props.themeChosen}
                            />
                            <RadioOption
                                label="Month"
                                selected={props.disappearingMessagesPeriod === "Month"}
                                onClick={() => props.setDisappearingMessagesPeriod("Month")}
                                themeChosen={props.themeChosen}
                            />
                            <RadioOption
                                label="Off"
                                selected={props.disappearingMessagesPeriod === "Off"}
                                onClick={() => props.setDisappearingMessagesPeriod("Off")}
                                themeChosen={props.themeChosen}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RadioOption(props: { label: string, selected: boolean, onClick: () => void, themeChosen: string }) {
    return (
        <div
            className={`group flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={props.onClick}
        >
            <div className="relative flex items-center justify-center w-8 h-8">
                {props.selected && (
                    <>
                        <div className="absolute w-8 h-8 bg-[#3B7E9B]/20 rounded-full blur-md animate-pulse"></div>
                        <div className="absolute w-3 h-3 bg-[#3B7E9B] rounded-full shadow-[0_0_20px_rgba(59,126,155,0.8)]"></div>
                        <div className="absolute w-6 h-6 rounded-full border-[3px] border-[#3B7E9B] shadow-[0_0_15px_rgba(59,126,155,0.6)]"></div>
                    </>
                )}
            </div>
            <div className={`flex-1 text-base xl:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                {props.label}
            </div>
        </div>
    );
}