import {useState, useEffect} from 'react'

export default function Privacy(props: any) {

    return (
        <div className={`relative left-0 w-full top-0 h-[90%] ${props.themeChosen === "Dark" ? "bg-[#323232] bg-opacity-60 border-[#0D1317] " : "bg-gray-300 border-gray-400 shadow-lg border-2"} border-black border-2 flex flex-col`}>
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className={`relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl hover:cursor-pointer`} 
                        onClick={() => {
                            props.setPressedSettings(true)
                            props.setPressPrivacy(false)
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(false)
                            props.setProfilePicPrivPress(false)
                            props.setStatusPrivPress(false)
                            props.setDisappearingMessagesPressed(false)
                            props.blockedContactsPressed(false)
                        }}>
                    <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "back_image_black.png"}`} className="justify-center items-center w-[20px] h-[20px]  xss:w-6 xss:h-6 aspect-square"></img>
                </div>
                <div className={`relative indent-[20px] left-[2%] w-[40%] text-lg xss:text-xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-sans flex flex-row justify-start items-center`}>Privacy</div>
            </div>

            <div className="absolute left-0 w-full top-[15%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className={`relative flex flex-row h-[2%] left-[6%] w-[96%] text-base xss:text-lg ${props.themeChosen === "Dark" ? "text-[#CBD4E0]" : "text-black"}`}>Who can see my personal info</div>
                    <ProfilePicturePrivacy setProfilePicPrivPress={props.setProfilePicPrivPress} setPressPrivacy={props.setPressPrivacy} visibilityProfilePic={props.visibilityProfilePic} themeChosen={props.themeChosen}></ProfilePicturePrivacy>
                    <StatusPrivacy setStatusPrivPress={props.setStatusPrivPress} setPressPrivacy={props.setPressPrivacy} visibilityStatus={props.visibilityStatus} themeChosen={props.themeChosen}></StatusPrivacy>
                    <div className={`relative flex flex-row top-[6%] h-[6%] left-[6%] w-[96%] text-base xss:text-lg ${props.themeChosen === "Dark" ? "text-[#CBD4E0]" : "text-black"}`}>Disappearing messages</div>
                    <DisappearingMessages disappearingMessagesPeriod={props.disappearingMessagesPeriod} setDisappearingMessagesPressed={props.setDisappearingMessagesPressed}
                                          setPressPrivacy={props.setPressPrivacy} disappearingMessagesPressed={props.disappearingMessagesPressed} themeChosen={props.themeChosen}
                    ></DisappearingMessages>
                    {/* <Theme userObj={props.userObj} themePressed={props.themePressed} setThemePressed={props.setThemePressed} themeChosen={props.themeChosen}></Theme> */}
                    {/* <div className="relative flex flex-row top-[8%] h-[6%] left-[6%] w-[96%] text-xl text-[#CBD4E0]">Blocked contacts</div> */}
                    <div className="relative top-[4%] left-[4%] w-[92%] h-[2px] bg-gray-500 bg-opacity-60"></div>
                    <BlockedContacts blockedContacts={props.blockedContacts} setBlockedContactsPressed={props.setBlockedContactsPressed} setPressPrivacy={props.setPressPrivacy} themeChosen={props.themeChosen}></BlockedContacts>
                    {/* <Fonts userObj={props.userObj} fontPressed={props.fontPressed} setFontPressed={props.setFontPressed} fontChosen={props.fontChosen}></Fonts> */}
                </div>
            </div>
        </div>
    );
}

export function ProfilePicturePrivacy(props: any) {

    return (
        <div className={`relative flex flex-row top-[4%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40 " : "border-gray-400 border-2 hover:bg-opacity-30"} hover:cursor-pointer`}
            onClick={() => {props.setProfilePicPrivPress(true); props.setPressPrivacy(false)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-base xss:text-lg items-end font-medium`}>Profile picture</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-sm xss:text-base`}>{props.visibilityProfilePic}</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "./next-arrow-wout-tail-nobg.png" : "next-arrow-black-nobg.png"}`} className="w-[10px] h-4 xss:w-3 xss:h-5"></img>
            </div>
        </div>
    );
}


export function StatusPrivacy(props: any) {

    return (
        <div className={`relative flex flex-row top-[4%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40 " : "border-gray-400 border-2 hover:bg-opacity-30"} hover:cursor-pointer`}
            onClick={() => {props.setStatusPrivPress(true); props.setPressPrivacy(false)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-base xss:text-lg items-end font-medium`}>Status</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-sm xss:text-base`}>{props.visibilityStatus}</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "./next-arrow-wout-tail-nobg.png" : "next-arrow-black-nobg.png"}`} className="w-[10px] h-4 xss:w-3 xss:h-5"></img>
            </div>
        </div>
    );
}

export function DisappearingMessages(props: any) {

    /* DEBUG */
    useEffect(() => {
        console.log("disappearing messages pressed? " + JSON.stringify(props.disappearingMessagesPressed))
    }, [props.disappearingMessagesPressed])

    return (
        <div className={`relative flex flex-row top-[4%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40 " : "border-gray-400 border-2 hover:bg-opacity-30"} hover:cursor-pointer`}
            onClick={() => {props.setDisappearingMessagesPressed(true); props.setPressPrivacy(false)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-base xss:text-lg items-end font-medium`}>Default duration</div>
                {props.disappearingMessagesPeriod === -1 && <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-sm xss:text-base`}>Off</div>}
                {props.disappearingMessagesPeriod !== -1 && <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-sm xss:text-base`}>{props.disappearingMessagesPeriod}</div>}
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "./next-arrow-wout-tail-nobg.png" : "next-arrow-black-nobg.png"}`} className="w-3 h-5"></img>
            </div>
        </div>
    );
}

export function BlockedContacts(props: any) {

    return (
        <div className={`relative flex flex-row top-[6%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40 " : "border-gray-400 border-2 hover:bg-opacity-30"} hover:cursor-pointer`}
            onClick={() => {props.setBlockedContactsPressed(true); props.setPressPrivacy(false);}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-base xss:text-lg items-end font-medium`}>Blocked contacts</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-sm xss:text-base`}>{props.blockedContacts.length}</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "./next-arrow-wout-tail-nobg.png" : "next-arrow-black-nobg.png"}`} className="w-3 h-5"></img>
            </div>
        </div>
    );
}