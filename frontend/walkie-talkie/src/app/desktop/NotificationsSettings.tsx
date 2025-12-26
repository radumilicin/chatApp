import {useEffect, useState, useRef} from 'react'

export default function NotificationSettings( props: any ) {

    return (
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] border-y-4 ${props.themeChosen === "Dark" ? "bg-[#323232] bg-opacity-60 border-[#0D1317] " : "bg-gray-300 border-gray-400 shadow-lg border-2"} border-black border-2 flex flex-col`}>
            <div className={`absolute left-0 top-[1%] h-[5%] w-full flex flex-row ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : "bg-opacity-50 bg-transparent"}`}> 
                <div className={`relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl hover:cursor-pointer`} 
                        onClick={() => {
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(true)
                        }}>
                    <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "back_image_black.png"}`} className={`justify-center items-center w-6 h-6 aspect-square ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"}`}></img>
                </div>
                <div className={`relative indent-[20px] left-[2%] w-[40%] text-base lg:text-lg xl:text-xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-sans flex flex-row justify-start items-center`}>Notifications</div>
            </div>
            <div className={`absolute left-0 w-full top-[6%] h-[9%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : "bg-opacity-50 bg-transparent"}`}></div>
            <div className={`absolute left-0 w-full top-[15%] h-[85%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : "bg-opacity-50 bg-transparent"}`}>
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className={`relative flex flex-row left-[6%] h-[6%] w-[96%] text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? "text-gray-200" : "text-black"} font-medium`}>Messages</div>
                    <EnableNotifications user={props.user} userObj={props.userObj} users={props.users} setNotificationsEnabled={props.setNotificationsEnabled} notificationsEnabled={props.notificationsEnabled}
                                        setIncomingSoundsEnabled={props.setIncomingSoundsEnabled} incomingSoundsEnabled={props.incomingSoundsEnabled}    
                                        setOutgoingMessagesSoundsEnabled={props.setOutgoingMessagesSoundsEnabled} outgoingMessagesSoundsEnabled={props.outgoingMessagesSoundsEnabled}
                                        fetchUsers={props.fetchUsers} themeChosen={props.themeChosen}
                    ></EnableNotifications>
                    <div className={`relative flex flex-row top-[4%] left-[6%] h-[6%] w-[96%] text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? "text-gray-200" : "text-black"} font-medium`}>Message sounds</div>
                    <IncomingSounds user={props.user} userObj={props.userObj} users={props.users} setIncomingSoundsEnabled={props.setIncomingSoundsEnabled} incomingSoundsEnabled={props.incomingSoundsEnabled}
                                    incomingSoundsEnabledPending={props.incomingSoundsEnabledPending} setIncomingSoundsEnabledPending={props.setIncomingSoundsEnabledPending} fetchUsers={props.fetchUsers}
                                    setUserObj={props.setUserObj} themeChosen={props.themeChosen}
                    ></IncomingSounds>
                    <OutgoingSounds user={props.user} userObj={props.userObj} users={props.users} setOutgoingMessagesSoundsEnabled={props.setOutgoingMessagesSoundsEnabled} outgoingMessagesSoundsEnabled={props.outgoingMessagesSoundsEnabled}
                                    outgoingMessagesSoundsEnabledPending={props.outgoingMessagesSoundsEnabledPending} setOutgoingMessagesSoundsEnabledPending={props.setOutgoingMessagesSoundsEnabledPending}
                                    fetchUsers={props.fetchUsers} setUserObj={props.setUserObj} themeChosen={props.themeChosen}
                    ></OutgoingSounds>
                </div>
            </div>
        </div>
    );
}

export function EnableNotifications(props: any) {

    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip the first render to avoid calling API on mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        
        changeNotificationsEnabled();
    }, [props.notificationsEnabled])

    async function changeNotificationsEnabled() {

        console.log("In changeNotificationsEnabled")

        const data = {
            "new_setting": props.notificationsEnabled,
            "user": props.user
        }
        
        console.log("new_setting: " + JSON.stringify(props.notificationsEnabled))
        console.log("user: " + JSON.stringify(props.user))

        const resp = await fetch("http://localhost:3002/changeNotificationsEnabled", {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        if(!resp.ok) {
            console.log("Could not change sound notification on server")
            // alert("Could not change sound notification on server")
            props.setNotificationsEnabled(!props.notificationsEnabled);
            // props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled)
        } else {
            // props.fetchUsers()
        }
    }

    return (
        <div className={`relative flex flex-row justify-row h-[15%] lg:h-[12%] left-[2%] w-[96%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40 " : "border-gray-400 border-2 hover:bg-opacity-30"}`}>
            <div className="relative flex flex-row justify-center items-center w-[15%] h-full">
                <img src={`${props.themeChosen === "Dark" ? "bell-icon.png" : "bell-icon-black-nobg.png"}`} className="w-[24px] h-[24px] lg:w-[28px] lg:h-[28px] xl:w-8 xl:h-8"></img>
            </div>
            <div className="relative flex flex-col justify-begin w-[70%]">
                <div className={`relative flex flex-row w-full h-[50%] items-end text-sm lg:text-base font-medium  ${props.themeChosen === "Dark" ? "" : "text-black"} `}>Message notifications</div>
                <div className={`relative flex flex-row w-full h-[50%] text-xs lg:text-sm font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-black"} `}>Enable notification sound</div>
            </div>
            <div className="relative flex flex-row items-center w-[15%] h-full">
                <div className={`absolute w-9 h-5 xl:w-12 xl:h-6 ${props.notificationsEnabled ? 'bg-green-700' : 'bg-slate-700'} rounded-xl hover:cursor-pointer`}
                    onClick={() => {
                        props.setNotificationsEnabled(!props.notificationsEnabled)
                    }}
                    ></div>
                <div className={`absolute w-3 h-3 xl:w-4 xl:h-4 ${props.notificationsEnabled ? 'ml-5 xl:ml-7' : 'ml-1'} rounded-full bg-white hover:cursor-pointer z-30`}
                    onClick={() => {
                        props.setNotificationsEnabled(!props.notificationsEnabled)
                    }}
                ></div>
            </div>
        </div>
    );
}

export function IncomingSounds(props: any) {
        
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip the first render to avoid calling API on mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        
        changeIncomingSoundsSetting();
    }, [props.incomingSoundsEnabled])

    const changeIncomingSoundsSetting = async () => {

        const data = {
            "new_setting": props.incomingSoundsEnabled,
            "user": props.user
        }

        const resp = await fetch("http://localhost:3002/changeIncomingMessageSoundsSetting", {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        if(!resp.ok) {
            console.log("Could not change sound notification on server")
            // Revert on failure
            props.setIncomingSoundsEnabled(!props.incomingSoundsEnabled);
        } else {
            // props.fetchUsers()
        }
    }

    return (
        <div className={`relative flex flex-row justify-row top-[4%] h-[15%] lg:h-[12%] left-[2%] w-[96%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40 " : "border-gray-400 border-2 hover:bg-opacity-30"}`}>
            <div className="relative flex flex-row justify-center items-center w-[15%] h-full">
                <img src={`${props.themeChosen === "Dark" ? "./arrow_incoming.png" : "arrow_incoming_black.png"}`} className="w-[24px] h-[24px] lg:w-[28px] lg:h-[28px] xl:w-8 xl:h-8"></img>
            </div>
            <div className="relative flex flex-col justify-begin w-[70%] h-full">
                <div className={`relative flex flex-row w-full h-[50%] items-end text-sm lg:text-base font-medium ${props.themeChosen === "Dark" ? "" : "text-black"}`}>Incoming sounds</div>
                <div className={`relative flex flex-row w-full h-[50%] text-xs lg:text-sm font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Play sound when receiving a message</div>
            </div>
            <div className="relative flex flex-row items-center w-[15%] h-full">
                <div className={`absolute w-9 h-5 xl:w-12 xl:h-6 ${props.incomingSoundsEnabled ? 'bg-green-700' : 'bg-slate-700'} rounded-xl hover:cursor-pointer`}
                    onClick={() => {props.setIncomingSoundsEnabled(!props.incomingSoundsEnabled)}}
                    ></div>
                <div className={`absolute w-3 h-3 xl:w-4 xl:h-4 ${props.incomingSoundsEnabled ? 'ml-5 xl:ml-7' : 'ml-1'} rounded-full bg-white hover:cursor-pointer z-30`}
                    onClick={() => {props.setIncomingSoundsEnabled(!props.incomingSoundsEnabled)}}
                ></div>
            </div>
        </div>
    );
}

export function OutgoingSounds(props: any) {

    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip the first render to avoid calling API on mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        
        changeOutgoingSoundsSetting();
    }, [props.outgoingMessagesSoundsEnabled])


    const changeOutgoingSoundsSetting = async () => {

        const data = {
            "new_setting": props.outgoingMessagesSoundsEnabled,
            "user": props.user
        }

        const resp = await fetch("http://localhost:3002/changeOutgoingMessageSoundsSetting", {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        if(!resp.ok) {
            console.log("Could not change sound notification on server")
            // Revert on failure
            props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled);
        } else {
            // props.fetchUsers()
        }
    }

    return (
        <div className={`relative flex flex-row justify-row top-[4%] h-[15%] lg:h-[12%] left-[2%] w-[96%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40 " : "border-gray-400 border-2 hover:bg-opacity-30"}`}>
            <div className="relative flex flex-row justify-center items-center w-[15%] h-full">
                <img src={`${props.themeChosen === "Dark" ? "./arrow_outgoing.png" : "arrow_outgoing_black.png"}`} className="w-[24px] h-[24px] lg:w-[28px] lg:h-[28px] xl:w-8 xl:h-8"></img>
            </div>
            <div className="relative flex flex-col justify-begin w-[70%] h-full">
                <div className={`relative flex flex-row w-full h-[50%] items-end text-sm lg:text-base font-medium ${props.themeChosen === "Dark" ? "" : "text-black"}`}>Outgoing sounds</div>
                <div className={`relative flex flex-row w-full h-[50%] text-xs lg:text-sm font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Play sound when sending a message</div>
            </div>
            <div className="relative flex flex-row items-center w-[15%] h-full">
                <div className={`absolute w-9 h-5 xl:w-12 xl:h-6 ${props.outgoingMessagesSoundsEnabled ? 'bg-green-700' : 'bg-slate-700'} rounded-xl hover:cursor-pointer`}
                    onClick={() => {props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled)}}
                    ></div>
                <div className={`absolute w-3 h-3 xl:w-4 xl:h-4 ${props.outgoingMessagesSoundsEnabled ? 'ml-5 xl:ml-7' : 'ml-1'} rounded-full bg-white hover:cursor-pointer z-30`} 
                    onClick={() => {props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled)}}
                    ></div>
            </div>
        </div>
    );
}