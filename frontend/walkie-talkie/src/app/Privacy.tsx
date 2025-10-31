import {useState, useEffect} from 'react'

export default function Privacy(props: any) {

    return (
        <div className="relative left-[8%] w-[30%] top-[5%] h-[90%] bg-[#637081] border-black border-2 flex flex-col bg-opacity-70">
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className="relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-slate-400 hover:rounded-xl hover:cursor-pointer" 
                        onClick={() => {
                            props.setPressedSettings(true)
                            props.setPressPrivacy(false)
                        }}>
                    <img src="/back-arrow.png" className="justify-center items-center max-h-[70%] aspect-square"></img>
                </div>
                <div className="relative indent-[20px] left-[2%] w-[40%] text-xl font-semibold text-white font-sans flex flex-row justify-start items-center">Privacy</div>
            </div>

            <div className="absolute left-0 w-full top-[15%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className="relative flex flex-row h-[2%] left-[6%] w-[96%] text-xl text-[#CBD4E0]">Who can see my personal info</div>
                    <ProfilePicturePrivacy setProfilePicPrivPress={props.setProfilePicPrivPress} setPressPrivacy={props.setPressPrivacy}></ProfilePicturePrivacy>
                    <StatusPrivacy setStatusPrivPress={props.setStatusPrivPress} setPressPrivacy={props.setPressPrivacy}></StatusPrivacy>
                    <div className="relative flex flex-row top-[6%] h-[6%] left-[6%] w-[96%] text-xl text-[#CBD4E0]">Disappearing messages</div>
                    <DisappearingMessages></DisappearingMessages>
                    {/* <Theme userObj={props.userObj} themePressed={props.themePressed} setThemePressed={props.setThemePressed} themeChosen={props.themeChosen}></Theme> */}
                    {/* <div className="relative flex flex-row top-[8%] h-[6%] left-[6%] w-[96%] text-xl text-[#CBD4E0]">Blocked contacts</div> */}
                    <div className="relative top-[4%] left-[4%] w-[92%] h-[2px] bg-gray-500 bg-opacity-60"></div>
                    <BlockedContacts blockedContacts={props.blockedContacts}></BlockedContacts>
                    {/* <Fonts userObj={props.userObj} fontPressed={props.fontPressed} setFontPressed={props.setFontPressed} fontChosen={props.fontChosen}></Fonts> */}
                </div>
            </div>
        </div>
    );
}

export function ProfilePicturePrivacy(props: any) {

    return (
        <div className="relative flex flex-row top-[4%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer"
            onClick={() => {props.setProfilePicPrivPress(true); props.setPressPrivacy(false)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className="relative flex flex-row h-[50%] w-full indent-[20px] text-white text-lg items-end font-medium">Profile picture</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] text-white text-base`}>Everyone</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src="./next-arrow-wout-tail-nobg.png" className="w-3 h-5"></img>
            </div>
        </div>
    );
}


export function StatusPrivacy(props: any) {

    return (
        <div className="relative flex flex-row top-[4%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer"
            onClick={() => {props.setStatusPrivPress(true); props.setPressPrivacy(false)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className="relative flex flex-row h-[50%] w-full indent-[20px] text-white text-lg items-end font-medium">Status</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] text-white text-base`}>Everyone</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src="./next-arrow-wout-tail-nobg.png" className="w-3 h-5"></img>
            </div>
        </div>
    );
}

export function DisappearingMessages(props: any) {

    return (
        <div className="relative flex flex-row top-[4%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer"
            onClick={() => {}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className="relative flex flex-row h-[50%] w-full indent-[20px] text-white text-lg items-end font-medium">Default duration</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] text-white text-base`}>Off</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src="./next-arrow-wout-tail-nobg.png" className="w-3 h-5"></img>
            </div>
        </div>
    );
}

export function BlockedContacts(props: any) {

    return (
        <div className="relative flex flex-row top-[6%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer"
            onClick={() => {}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className="relative flex flex-row h-[50%] w-full indent-[20px] text-white text-lg items-end font-medium">Blocked contacts</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] text-white text-base`}>{props.blockedContacts.length}</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src="./next-arrow-wout-tail-nobg.png" className="w-3 h-5"></img>
            </div>
        </div>
    );
}