import {useEffect, useState, useRef} from 'react'

export default function NotificationSettings( props: any ) {

    return (
        <div className="relative left-[8%] w-[30%] top-[5%] h-[90%] bg-[#637081] border-black border-2 flex flex-col bg-opacity-70">
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className="relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-slate-400 hover:rounded-xl hover:cursor-pointer" 
                        onClick={() => {
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(true)
                        }}>
                    <img src="/back-arrow.png" className="justify-center items-center max-h-[70%] aspect-square"></img>
                </div>
                <div className="relative indent-[20px] left-[2%] w-[40%] text-xl font-semibold text-white font-sans flex flex-row justify-start items-center">Notifications</div>
            </div>

            <div className="absolute left-0 w-full top-[15%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className="relative flex flex-row left-[6%] h-[6%] w-[96%] text-xl text-[#CBD4E0] font-medium">Messages</div>
                    <EnableNotifications user={props.user} userObj={props.userObj} users={props.users} setNotificationsEnabled={props.setNotificationsEnabled} notificationsEnabled={props.notificationsEnabled}
                                        setIncomingSoundsEnabled={props.setIncomingSoundsEnabled} incomingSoundsEnabled={props.incomingSoundsEnabled}    
                                        setOutgoingMessagesSoundsEnabled={props.setOutgoingMessagesSoundsEnabled} outgoingMessagesSoundsEnabled={props.outgoingMessagesSoundsEnabled}
                                        fetchUsers={props.fetchUsers}
                    ></EnableNotifications>
                    <div className="relative flex flex-row top-[4%] left-[6%] h-[6%] w-[96%] text-[#CBD4E0] text-xl font-medium">Message sounds</div>
                    <IncomingSounds user={props.user} userObj={props.userObj} users={props.users} setIncomingSoundsEnabled={props.setIncomingSoundsEnabled} incomingSoundsEnabled={props.incomingSoundsEnabled}
                                    incomingSoundsEnabledPending={props.incomingSoundsEnabledPending} setIncomingSoundsEnabledPending={props.setIncomingSoundsEnabledPending} fetchUsers={props.fetchUsers}
                                    setUserObj={props.setUserObj}
                    ></IncomingSounds>
                    <OutgoingSounds user={props.user} userObj={props.userObj} users={props.users} setOutgoingMessagesSoundsEnabled={props.setOutgoingMessagesSoundsEnabled} outgoingMessagesSoundsEnabled={props.outgoingMessagesSoundsEnabled}
                                    outgoingMessagesSoundsEnabledPending={props.outgoingMessagesSoundsEnabledPending} setOutgoingMessagesSoundsEnabledPending={props.setOutgoingMessagesSoundsEnabledPending}
                                    fetchUsers={props.fetchUsers} setUserObj={props.setUserObj}
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
        <div className="relative flex flex-row justify-row h-[12%] left-[2%] w-[96%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40">
            <div className="relative flex flex-row justify-center items-center w-[15%] h-full">
                <img src="bell-icon.png" className="w-8 h-8"></img>
            </div>
            <div className="relative flex flex-col justify-begin w-[70%]">
                <div className="relative flex flex-row w-full h-[50%] items-end text-lg font-medium">Message notifications</div>
                <div className="relative flex flex-row w-full h-[50%] text-base font-medium text-white">Enable notification sound</div>
            </div>
            <div className="relative flex flex-row items-center w-[15%] h-full">
                <div className={`absolute w-12 h-6 ${props.notificationsEnabled ? 'bg-green-700' : 'bg-slate-700'} rounded-xl hover:cursor-pointer`}
                    onClick={() => {
                        props.setNotificationsEnabled(!props.notificationsEnabled)
                    }}
                    ></div>
                <div className={`absolute w-4 h-4 ${props.notificationsEnabled ? 'ml-7' : 'ml-1'} rounded-full bg-white hover:cursor-pointer z-30`}
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
        <div className="relative flex flex-row justify-row top-[4%] h-[12%] left-[2%] w-[96%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40">
            <div className="relative flex flex-row justify-center items-center w-[15%] h-full">
                <img src="./arrow_incoming.png" className="w-8 h-8"></img>
            </div>
            <div className="relative flex flex-col justify-begin w-[70%] h-full">
                <div className="relative flex flex-row w-full h-[50%] items-end text-lg font-medium">Incoming sounds</div>
                <div className="relative flex flex-row w-full h-[50%] text-base font-medium">Play sound when receiving a message</div>
            </div>
            <div className="relative flex flex-row items-center w-[15%] h-full">
                <div className={`absolute w-12 h-6 ${props.incomingSoundsEnabled ? 'bg-green-700' : 'bg-slate-700'} rounded-xl hover:cursor-pointer`}
                    onClick={() => {props.setIncomingSoundsEnabled(!props.incomingSoundsEnabled)}}
                    ></div>
                <div className={`absolute w-4 h-4 ${props.incomingSoundsEnabled ? 'ml-7' : 'ml-1'} rounded-full bg-white hover:cursor-pointer z-30`}
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
        <div className="relative flex flex-row justify-row top-[4%] h-[12%] left-[2%] w-[96%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40">
            <div className="relative flex flex-row justify-center items-center w-[15%] h-full">
                <img src="./arrow_outgoing.png" className="w-8 h-8"></img>
            </div>
            <div className="relative flex flex-col justify-begin w-[70%] h-full">
                <div className="relative flex flex-row w-full h-[50%] items-end text-lg font-medium">Outgoing sounds</div>
                <div className="relative flex flex-row w-full h-[50%] text-base font-medium">Play sound when sending a message</div>
            </div>
            <div className="relative flex flex-row items-center w-[15%] h-full">
                <div className={`absolute w-12 h-6 ${props.outgoingMessagesSoundsEnabled ? 'bg-green-700' : 'bg-slate-700'} rounded-xl hover:cursor-pointer`}
                    onClick={() => {props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled)}}
                    ></div>
                <div className={`absolute w-4 h-4 ${props.outgoingMessagesSoundsEnabled ? 'ml-7' : 'ml-1'} rounded-full bg-white hover:cursor-pointer z-30`} 
                    onClick={() => {props.setOutgoingMessagesSoundsEnabled(!props.outgoingMessagesSoundsEnabled)}}
                    ></div>
            </div>
        </div>
    );
}