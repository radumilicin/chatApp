import {useState, useEffect} from 'react'

export default function Privacy(props: any) {

    return (
        <div className={`shrink-0 w-[30%] min-w-[400px] h-full ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"} overflow-y-scroll no-scrollbar`}>
            {/* Header */}
            <div className="relative w-full pt-4 px-4 pb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                            onClick={() => {
                                props.setPressedSettings(true)
                                props.setPressPrivacy(false)
                            }}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "back_image_black.png"}`} className="w-6 h-6 aspect-square opacity-90" alt="Back" />
                    </div>
                    <h1 className={`text-2xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent`}>
                        Privacy
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex flex-col gap-6">
                    {/* Personal Info Section */}
                    <div className="flex flex-col gap-3">
                        <h2 className={`text-sm xl:text-base font-semibold uppercase tracking-wide ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Personal Information
                        </h2>
                        <ProfilePicturePrivacy setProfilePicPrivPress={props.setProfilePicPrivPress} setPressPrivacy={props.setPressPrivacy} visibilityProfilePic={props.visibilityProfilePic} themeChosen={props.themeChosen}></ProfilePicturePrivacy>
                        <StatusPrivacy setStatusPrivPress={props.setStatusPrivPress} setPressPrivacy={props.setPressPrivacy} visibilityStatus={props.visibilityStatus} themeChosen={props.themeChosen}></StatusPrivacy>
                    </div>

                    {/* Messages Section */}
                    <div className="flex flex-col gap-3">
                        <h2 className={`text-sm xl:text-base font-semibold uppercase tracking-wide ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Messages
                        </h2>
                        <DisappearingMessages disappearingMessagesPeriod={props.disappearingMessagesPeriod} setDisappearingMessagesPressed={props.setDisappearingMessagesPressed}
                                              setPressPrivacy={props.setPressPrivacy} disappearingMessagesPressed={props.disappearingMessagesPressed} themeChosen={props.themeChosen}
                        ></DisappearingMessages>
                    </div>

                    {/* Blocked Section */}
                    <div className="flex flex-col gap-3">
                        <h2 className={`text-sm xl:text-base font-semibold uppercase tracking-wide ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Blocked
                        </h2>
                        <BlockedContacts blockedContacts={props.blockedContacts} setBlockedContactsPressed={props.setBlockedContactsPressed} setPressPrivacy={props.setPressPrivacy} themeChosen={props.themeChosen}></BlockedContacts>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProfilePicturePrivacy(props: any) {

    return (
        <div
            className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {props.setProfilePicPrivPress(true); props.setPressPrivacy(false)}}
        >
            <div className="flex-1 flex flex-col gap-1">
                <div className={`text-base xl:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Profile picture
                </div>
                <div className={`text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    {props.visibilityProfilePic}
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}


export function StatusPrivacy(props: any) {

    return (
        <div
            className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {props.setStatusPrivPress(true); props.setPressPrivacy(false)}}
        >
            <div className="flex-1 flex flex-col gap-1">
                <div className={`text-base xl:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Status
                </div>
                <div className={`text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    {props.visibilityStatus}
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
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
        <div
            className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {props.setDisappearingMessagesPressed(true); props.setPressPrivacy(false)}}
        >
            <div className="flex-1 flex flex-col gap-1">
                <div className={`text-base xl:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Default duration
                </div>
                <div className={`text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    {props.disappearingMessagesPeriod === -1 ? "Off" : props.disappearingMessagesPeriod}
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}

export function BlockedContacts(props: any) {

    return (
        <div
            className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {props.setBlockedContactsPressed(true); props.setPressPrivacy(false);}}
        >
            <div className="flex-1 flex flex-col gap-1">
                <div className={`text-base xl:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Blocked contacts
                </div>
                <div className={`text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    {props.blockedContacts.length} {props.blockedContacts.length === 1 ? "contact" : "contacts"}
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}