import {useEffect, useState, useRef} from 'react'

export default function NotificationSettings( props: any ) {

    const prevEnableNotifications = useRef(false);
    const prevEnableIncomingSounds = useRef(false);
    const prevEnableOutgoingSounds = useRef(false);

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
            // Revert on failure
            props.setNotificationsEnabled(!props.notificationsEnabled);
        } else {
            console.log("Sound notification changed successfully")

            // When notifications are enabled, enable both incoming and outgoing
            if(props.notificationsEnabled) {
                if(!props.incomingSoundsEnabled) {
                    props.setIncomingSoundsEnabled(true)
                }
                if(!props.outgoingMessagesSoundsEnabled) {
                    props.setOutgoingMessagesSoundsEnabled(true)
                }
            } else {
                // When notifications are disabled, disable both incoming and outgoing
                if(props.incomingSoundsEnabled) {
                    props.setIncomingSoundsEnabled(false)
                }
                if(props.outgoingMessagesSoundsEnabled) {
                    props.setOutgoingMessagesSoundsEnabled(false)
                }
            }
        }
    }
    
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
            console.log("Changed sound notifications on server")

            // If incoming is now disabled, disable notifications
            if(!props.incomingSoundsEnabled && props.notificationsEnabled) {
                props.setNotificationsEnabled(false)
            }
            // If incoming is now enabled AND outgoing is also enabled, enable notifications
            else if(props.incomingSoundsEnabled && props.outgoingMessagesSoundsEnabled && !props.notificationsEnabled) {
                props.setNotificationsEnabled(true)
            }
        }
    }

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
            console.log("Changed sound notifications on server")

            // If outgoing is now disabled, disable notifications
            if(!props.outgoingMessagesSoundsEnabled && props.notificationsEnabled) {
                props.setNotificationsEnabled(false)
            }
            // If outgoing is now enabled AND incoming is also enabled, enable notifications
            else if(props.outgoingMessagesSoundsEnabled && props.incomingSoundsEnabled && !props.notificationsEnabled) {
                props.setNotificationsEnabled(true)
            }
        }
    }

    return (
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg rounded-2xl flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            <div className={`absolute left-0 top-[1%] h-[5%] w-full flex flex-row ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className={`relative left-[2%] w-[8%] text-2xl font-semibold font-sans flex flex-row justify-center items-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                        onClick={() => {
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(true)
                        }}>
                    <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className={`justify-center items-center w-6 h-6 aspect-square opacity-90`}></img>
                </div>
                <div className={`relative indent-[20px] left-[2%] w-[40%] text-base lg:text-lg xl:text-xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} font-sans flex flex-row justify-start items-center`}>Notifications</div>
            </div>
            <div className={`absolute left-0 w-full top-[6%] h-[9%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}></div>
            <div className={`absolute left-0 w-full top-[15%] h-[85%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className={`relative flex flex-row left-[6%] h-[6%] w-[96%] text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? "text-gray-200" : "text-black"} font-medium`}>Messages</div>
                    <EnableNotifications user={props.user} userObj={props.userObj} users={props.users} setNotificationsEnabled={props.setNotificationsEnabled} notificationsEnabled={props.notificationsEnabled}
                                        setIncomingSoundsEnabled={props.setIncomingSoundsEnabled} incomingSoundsEnabled={props.incomingSoundsEnabled}    
                                        setOutgoingMessagesSoundsEnabled={props.setOutgoingMessagesSoundsEnabled} outgoingMessagesSoundsEnabled={props.outgoingMessagesSoundsEnabled}
                                        fetchUsers={props.fetchUsers} themeChosen={props.themeChosen} changeNotificationsEnabled={changeNotificationsEnabled} prevEnableNotifications={prevEnableNotifications}
                    ></EnableNotifications>
                    <div className={`relative flex flex-row top-[4%] left-[6%] h-[6%] w-[96%] text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? "text-gray-200" : "text-black"} font-medium`}>Message sounds</div>
                    <IncomingSounds user={props.user} userObj={props.userObj} users={props.users} setIncomingSoundsEnabled={props.setIncomingSoundsEnabled} incomingSoundsEnabled={props.incomingSoundsEnabled}
                                    incomingSoundsEnabledPending={props.incomingSoundsEnabledPending} setIncomingSoundsEnabledPending={props.setIncomingSoundsEnabledPending} fetchUsers={props.fetchUsers}
                                    setUserObj={props.setUserObj} themeChosen={props.themeChosen} changeIncomingSoundsSetting={changeIncomingSoundsSetting} prevEnableIncomingSounds={prevEnableIncomingSounds}
                    ></IncomingSounds>
                    <OutgoingSounds user={props.user} userObj={props.userObj} users={props.users} setOutgoingMessagesSoundsEnabled={props.setOutgoingMessagesSoundsEnabled} outgoingMessagesSoundsEnabled={props.outgoingMessagesSoundsEnabled}
                                    outgoingMessagesSoundsEnabledPending={props.outgoingMessagesSoundsEnabledPending} setOutgoingMessagesSoundsEnabledPending={props.setOutgoingMessagesSoundsEnabledPending}
                                    fetchUsers={props.fetchUsers} setUserObj={props.setUserObj} themeChosen={props.themeChosen} changeOutgoingSoundsSetting={changeOutgoingSoundsSetting} prevEnableOutgoingSounds={prevEnableOutgoingSounds}
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
        
        props.changeNotificationsEnabled();
    }, [props.notificationsEnabled])


    return (
        <div className={`relative flex flex-row justify-row h-[15%] lg:h-[12%] left-[2%] w-[96%] rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-[1.02] active:scale-[0.98]`}>
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
                        props.prevEnableNotifications.current = props.notificationsEnabled
                        props.setNotificationsEnabled(!props.notificationsEnabled)
                    }}
                    ></div>
                <div className={`absolute w-3 h-3 xl:w-4 xl:h-4 ${props.notificationsEnabled ? 'ml-5 xl:ml-7' : 'ml-1'} rounded-full bg-white hover:cursor-pointer z-30`}
                    onClick={() => {
                        props.prevEnableNotifications.current = props.notificationsEnabled
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
        
        props.changeIncomingSoundsSetting();
    }, [props.incomingSoundsEnabled])

    
    return (
        <div className={`relative flex flex-row justify-row top-[4%] h-[15%] lg:h-[12%] left-[2%] w-[96%] rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-[1.02] active:scale-[0.98]`}>
            <div className="relative flex flex-row justify-center items-center w-[15%] h-full">
                <img src={`${props.themeChosen === "Dark" ? "./arrow_incoming.png" : "arrow_incoming_black.png"}`} className="w-[24px] h-[24px] lg:w-[28px] lg:h-[28px] xl:w-8 xl:h-8"></img>
            </div>
            <div className="relative flex flex-col justify-begin w-[70%] h-full">
                <div className={`relative flex flex-row w-full h-[50%] items-end text-sm lg:text-base font-medium ${props.themeChosen === "Dark" ? "" : "text-black"}`}>Incoming sounds</div>
                <div className={`relative flex flex-row w-full h-[50%] text-xs lg:text-sm font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Play sound when receiving a message</div>
            </div>
            <div className="relative flex flex-row items-center w-[15%] h-full">
                <div className={`absolute w-9 h-5 xl:w-12 xl:h-6 ${props.incomingSoundsEnabled ? 'bg-green-700' : 'bg-slate-700'} rounded-xl hover:cursor-pointer`}
                    onClick={() => {
                        props.prevEnableIncomingSounds.current = props.incomingSoundsEnabled
                        props.setIncomingSoundsEnabled(!props.incomingSoundsEnabled)
                    }}
                    ></div>
                <div className={`absolute w-3 h-3 xl:w-4 xl:h-4 ${props.incomingSoundsEnabled ? 'ml-5 xl:ml-7' : 'ml-1'} rounded-full bg-white hover:cursor-pointer z-30`}
                    onClick={() => {
                        props.prevEnableIncomingSounds.current = props.incomingSoundsEnabled
                        props.setIncomingSoundsEnabled(!props.incomingSoundsEnabled)
                    }}
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
        
        props.changeOutgoingSoundsSetting();
    }, [props.outgoingMessagesSoundsEnabled])

    return (
        <div className={`relative flex flex-row justify-row top-[4%] h-[15%] lg:h-[12%] left-[2%] w-[96%] rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-[1.02] active:scale-[0.98]`}>
            <div className="relative flex flex-row justify-center items-center w-[15%] h-full">
                <img src={`${props.themeChosen === "Dark" ? "./arrow_outgoing.png" : "arrow_outgoing_black.png"}`} className="w-[24px] h-[24px] lg:w-[28px] lg:h-[28px] xl:w-8 xl:h-8"></img>
            </div>
            <div className="relative flex flex-col justify-begin w-[70%] h-full">
                <div className={`relative flex flex-row w-full h-[50%] items-end text-sm lg:text-base font-medium ${props.themeChosen === "Dark" ? "" : "text-black"}`}>Outgoing sounds</div>
                <div className={`relative flex flex-row w-full h-[50%] text-xs lg:text-sm font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}>Play sound when sending a message</div>
            </div>
            <div className="relative flex flex-row items-center w-[15%] h-full">
                <div className={`absolute w-9 h-5 xl:w-12 xl:h-6 ${props.outgoingMessagesSoundsEnabled ? 'bg-green-700' : 'bg-slate-700'} rounded-xl hover:cursor-pointer`}
                    onClick={() => {
                        props.prevEnableOutgoingSounds.current = props.outgoingMessagesSoundsEnabled
                        props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled)
                    }}
                    ></div>
                <div className={`absolute w-3 h-3 xl:w-4 xl:h-4 ${props.outgoingMessagesSoundsEnabled ? 'ml-5 xl:ml-7' : 'ml-1'} rounded-full bg-white hover:cursor-pointer z-30`} 
                    onClick={() => {
                        props.prevEnableOutgoingSounds.current = props.outgoingMessagesSoundsEnabled
                        props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled)
                    }}
                    ></div>
            </div>
        </div>
    );
}