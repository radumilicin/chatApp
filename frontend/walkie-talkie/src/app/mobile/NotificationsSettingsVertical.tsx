import {useEffect, useRef} from 'react'

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
            props.setNotificationsEnabled(!props.notificationsEnabled);
        } else {
            console.log("Sound notification changed successfully")

            if(props.notificationsEnabled) {
                if(!props.incomingSoundsEnabled) {
                    props.setIncomingSoundsEnabled(true)
                }
                if(!props.outgoingMessagesSoundsEnabled) {
                    props.setOutgoingMessagesSoundsEnabled(true)
                }
            } else {
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
            props.setIncomingSoundsEnabled(!props.incomingSoundsEnabled);
        } else {
            console.log("Changed sound notifications on server")

            if(!props.incomingSoundsEnabled && props.notificationsEnabled) {
                props.setNotificationsEnabled(false)
            }
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
            props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled);
        } else {
            console.log("Changed sound notifications on server")

            if(!props.outgoingMessagesSoundsEnabled && props.notificationsEnabled) {
                props.setNotificationsEnabled(false)
            }
            else if(props.outgoingMessagesSoundsEnabled && props.incomingSoundsEnabled && !props.notificationsEnabled) {
                props.setNotificationsEnabled(true)
            }
        }
    }

    return (
        <div className={`relative left-0 w-full top-0 h-full ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"} overflow-y-auto no-scrollbar`}>
            {/* Header */}
            <div className="relative w-full pt-4 px-4 pb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                            onClick={() => {
                                props.setPressedSettings(true)
                                props.setPressNotifications(false)
                            }}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "back_image_black.png"}`} className="w-5 h-5 xss:w-6 xss:h-6 aspect-square opacity-90" alt="Back" />
                    </div>
                    <h1 className={`text-xl xss:text-2xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent`}>
                        Notifications
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex flex-col gap-6">
                    {/* Messages Section */}
                    <div className="flex flex-col gap-3">
                        <h2 className={`text-xs xss:text-sm font-semibold uppercase tracking-wide ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Messages
                        </h2>
                        <EnableNotifications user={props.user} userObj={props.userObj} users={props.users} setNotificationsEnabled={props.setNotificationsEnabled} notificationsEnabled={props.notificationsEnabled}
                                            setIncomingSoundsEnabled={props.setIncomingSoundsEnabled} incomingSoundsEnabled={props.incomingSoundsEnabled}
                                            setOutgoingMessagesSoundsEnabled={props.setOutgoingMessagesSoundsEnabled} outgoingMessagesSoundsEnabled={props.outgoingMessagesSoundsEnabled}
                                            fetchUsers={props.fetchUsers} themeChosen={props.themeChosen} changeNotificationsEnabled={changeNotificationsEnabled} prevEnableNotifications={prevEnableNotifications}
                        ></EnableNotifications>
                    </div>

                    {/* Message Sounds Section */}
                    <div className="flex flex-col gap-3">
                        <h2 className={`text-xs xss:text-sm font-semibold uppercase tracking-wide ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Message sounds
                        </h2>
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
        </div>
    );
}

export function EnableNotifications(props: any) {

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        props.changeNotificationsEnabled();
    }, [props.notificationsEnabled])


    return (
        <div className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}>
            <div className="flex-1 flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10" : "bg-gray-200/50"}`}>
                    <img src={`${props.themeChosen === "Dark" ? "bell-icon.png" : "bell-icon-black-nobg.png"}`} className="w-5 h-5 xss:w-6 xss:h-6" alt="Notifications" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className={`text-sm xss:text-base font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                        Message notifications
                    </div>
                    <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                        Enable notification sound
                    </div>
                </div>
            </div>
            <div className="relative flex items-center">
                <div className={`w-12 h-6 bg-gradient-to-r ${(props.notificationsEnabled && props.themeChosen === "Dark") ? 'from-cyan-400 via-blue-400 to-cyan-600' :
                                                             (props.notificationsEnabled && props.themeChosen === "Light") ? 'from-cyan-600 via-blue-600 to-cyan-900' :
                                                             (!props.notificationsEnabled && props.themeChosen === "Dark") ? 'bg-gray-400' :
                'bg-gray-900'} rounded-full transition-all duration-300 cursor-pointer ${props.notificationsEnabled ? 'shadow-[0_0_12px_rgba(59,126,155,0.6)]' : 'shadow-sm'}`}
                    onClick={() => {
                        props.prevEnableNotifications.current = props.notificationsEnabled
                        props.setNotificationsEnabled(!props.notificationsEnabled)
                    }}
                ></div>
                <div className={`absolute w-4 h-4 ${props.notificationsEnabled ? 'left-7' : 'left-1'} rounded-full bg-white transition-all duration-300 cursor-pointer shadow-lg ${props.notificationsEnabled ? 'shadow-[0_0_8px_rgba(59,126,155,0.8)]' : ''}`}
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
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        props.changeIncomingSoundsSetting();
    }, [props.incomingSoundsEnabled])


    return (
        <div className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}>
            <div className="flex-1 flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10" : "bg-gray-200/50"}`}>
                    <img src={`${props.themeChosen === "Dark" ? "./arrow_incoming.png" : "arrow_incoming_black.png"}`} className="w-5 h-5 xss:w-6 xss:h-6" alt="Incoming" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className={`text-sm xss:text-base font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                        Incoming sounds
                    </div>
                    <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                        Play sound when receiving a message
                    </div>
                </div>
            </div>
            <div className="relative flex items-center">
                <div className={`w-12 h-6 bg-gradient-to-r ${(props.incomingSoundsEnabled && props.themeChosen === "Dark") ? 'from-cyan-400 via-blue-400 to-cyan-600' :
                                                             (props.incomingSoundsEnabled && props.themeChosen === "Light") ? 'from-cyan-600 via-blue-600 to-cyan-900' :
                                                             (!props.incomingSoundsEnabled && props.themeChosen === "Dark") ? 'bg-gray-400' :
                'bg-gray-900'} rounded-full transition-all duration-300 cursor-pointer ${props.incomingSoundsEnabled ? 'shadow-[0_0_12px_rgba(59,126,155,0.6)]' : 'shadow-sm'}`}
                    onClick={() => {
                        props.prevEnableIncomingSounds.current = props.incomingSoundsEnabled
                        props.setIncomingSoundsEnabled(!props.incomingSoundsEnabled)
                    }}
                ></div>
                <div className={`absolute w-4 h-4 ${props.incomingSoundsEnabled ? 'left-7' : 'left-1'} rounded-full bg-white transition-all duration-300 cursor-pointer shadow-lg ${props.incomingSoundsEnabled ? 'shadow-[0_0_8px_rgba(59,126,155,0.8)]' : ''}`}
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
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        props.changeOutgoingSoundsSetting();
    }, [props.outgoingMessagesSoundsEnabled])

    return (
        <div className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}>
            <div className="flex-1 flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10" : "bg-gray-200/50"}`}>
                    <img src={`${props.themeChosen === "Dark" ? "./arrow_outgoing.png" : "arrow_outgoing_black.png"}`} className="w-5 h-5 xss:w-6 xss:h-6" alt="Outgoing" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className={`text-sm xss:text-base font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                        Outgoing sounds
                    </div>
                    <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                        Play sound when sending a message
                    </div>
                </div>
            </div>
            <div className="relative flex items-center">
                <div className={`w-12 h-6 bg-gradient-to-r ${(props.outgoingMessagesSoundsEnabled && props.themeChosen === "Dark") ? 'from-cyan-400 via-blue-400 to-cyan-600' :
                                                             (props.outgoingMessagesSoundsEnabled && props.themeChosen === "Light") ? 'from-cyan-600 via-blue-600 to-cyan-900' :
                                                             (!props.outgoingMessagesSoundsEnabled && props.themeChosen === "Dark") ? 'bg-gray-800' :
                'bg-gray-900'} rounded-full transition-all duration-300 cursor-pointer ${props.outgoingMessagesSoundsEnabled ? 'shadow-[0_0_12px_rgba(59,126,155,0.6)]' : 'shadow-sm'}`}
                    onClick={() => {
                        props.prevEnableOutgoingSounds.current = props.outgoingMessagesSoundsEnabled
                        props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled)
                    }}
                ></div>
                <div className={`absolute w-4 h-4 ${props.outgoingMessagesSoundsEnabled ? 'left-7' : 'left-1'} rounded-full bg-white transition-all duration-300 cursor-pointer shadow-lg ${props.outgoingMessagesSoundsEnabled ? 'shadow-[0_0_8px_rgba(59,126,155,0.8)]' : ''}`}
                    onClick={() => {
                        props.prevEnableOutgoingSounds.current = props.outgoingMessagesSoundsEnabled
                        props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled)
                    }}
                ></div>
            </div>
        </div>
    );
}