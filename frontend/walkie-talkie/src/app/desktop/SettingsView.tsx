import {useState, useRef, useEffect} from 'react'

export default function SettingsView(props) {
 
    const [searchedSettings, setSearchedSetting] = useState("");

    return (
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            <div className={`absolute left-0 top-[1%] h-[5%] w-full flex flex-row ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className={`relative left-[2%] w-[8%] text-2xl font-semibold font-sans flex flex-row justify-center items-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                        onClick={() => {
                            props.setPressedSettings(false);
                            props.setPressProfile(false);
                            props.setProfilePicPrivPress(false);
                            props.setStatusPrivPress(false);
                            props.setDisappearingMessagesPressed(false);
                            props.setBlockedContactsPressed(false);
                        }}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className={`justify-center items-center w-6 h-6 aspect-square opacity-90`}></img>
                    </div>
                <div className={`relative indent-[20px] left-[2%] w-[40%] text-xl xl:text-2xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-[#3B7E9B] to-[#5BA3C5]" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent font-sans flex flex-row justify-start items-center`}>Settings</div>
            </div>

            <SearchBar searchedSetting={searchedSettings} setSearchedSetting={setSearchedSetting} themeChosen={props.themeChosen}></SearchBar>

            <div className={`absolute left-0 w-full top-[20%] h-[80%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-2">
                    <CurrUserDiv curr_user={props.curr_user} users={props.users} images={props.images} themeChosen={props.themeChosen} setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile} 
                                setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications} setPressAppearance={props.setPressAppearance} 
                                setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress}></CurrUserDiv>
                    <PrivacyOption setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile} setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications}
                     setPressAppearance={props.setPressAppearance} setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress}
                     disappearingMessagesPeriod={props.disappearingMessagesPeriod} themeChosen={props.themeChosen}
                     ></PrivacyOption>
                    <NotificationsOption setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile} setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications} 
                        setPressAppearance={props.setPressAppearance} setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress} themeChosen={props.themeChosen}></NotificationsOption>
                    <AppearanceOption setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile} setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications} 
                        setPressAppearance={props.setPressAppearance} setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress} themeChosen={props.themeChosen}></AppearanceOption>
                    <LogOutOption loggedIn={props.loggedIn} logOutNow={props.logOutNow} setLoggedIn={props.setLoggedIn} themeChosen={props.themeChosen}></LogOutOption>
                    {/* <div className="">Account</div>
                    <div className="">Appearance</div>
                    <div className="">Notifications</div> */}
                </div>

            </div>
        </div>
    );
}

export function CurrUserDiv (props: any) {

    const [imageData, setImageData] = useState({'data' : ""})
    const [user, setUser] = useState(null);

    // type user is either current or other (0,1)
    function getProfileImage() {
        const user = props.users.find((user) => {
            return user.id === props.curr_user
        })
        const image = props.images.find((image: any) => image.id === user.profile_pic_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    function getCurrUser() {
        const user = props.users.find((user) => {
            return user.id === props.curr_user
        })

        return user;
    }

    useEffect(() => {
        setImageData(getProfileImage())
    }, [props.users, props.images])

    useEffect(() => {
        setUser(getCurrUser())
    }, [props.curr_user])

    return (
        <div
            className={`group relative flex items-center gap-4 mx-2 px-4 py-5 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {
                props.setPressedSettings(false);
                props.setPressProfile(true);
                props.setProfilePicPrivPress(false);
                props.setStatusPrivPress(false);
                props.setDisappearingMessagesPressed(false);
                props.setBlockedContactsPressed(false);
            }}
        >
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20" : "bg-gray-200 group-hover:bg-gray-300"} `}>
                {imageData.data !== "" ? (
                    <img
                        src={`data:image/jpg;base64,${imageData.data}`}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${props.themeChosen === "Dark" ? "border-[#3B7E9B]/50 group-hover:border-[#3B7E9B]" : "border-gray-400 group-hover:border-gray-600"} group-hover:scale-105`}
                        alt="Profile"
                    />
                ) : (
                    <img
                        src={`${props.themeChosen === "Dark" ? "./profilePic2.png" : "profilePic_black.png"}`}
                        className={`w-8 h-8 rounded-full opacity-90 transition-all group-hover:scale-105`}
                        alt="Default Profile"
                    />
                )}
            </div>
            <div className="flex-1 flex flex-col gap-1 min-w-0">
                {user && (
                    <>
                        <div className={`text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight truncate`}>
                            {user.username}
                        </div>
                        <div className={`text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium truncate`}>
                            {user.about}
                        </div>
                    </>
                )}
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}

export function PrivacyOption(props: any) {
    return (
        <div
            className={`group relative flex items-center gap-4 mx-2 mt-2 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {
                props.setPressNotifications(false)
                props.setPressAccount(false)
                props.setPressProfile(false)
                props.setPressAppearance(false)
                props.setPressedSettings(false)
                props.setPressPrivacy(true)
            }}
        >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20" : "bg-gray-200 group-hover:bg-gray-300"}`}>
                <img src="./lock-icon.svg" className={`w-6 h-6 transition-all group-hover:scale-110 ${props.themeChosen === "Dark" ? "invert" : ""}`} alt="Privacy" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
                <div className={`text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Privacy
                </div>
                <div className={`text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    Blocked contacts, disappearing messages
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

export function AppearanceOption( props: any ){
    return (
        <div
            className={`group relative flex items-center gap-4 mx-2 mt-2 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {
                props.setPressNotifications(false)
                props.setPressAccount(false)
                props.setPressProfile(false)
                props.setPressAppearance(true)
                props.setPressedSettings(false)
                props.setPressPrivacy(false)
                props.setProfilePicPrivPress(false)
            }}
        >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20" : "bg-gray-200 group-hover:bg-gray-300"}`}>
                <img src="./appearance-icon.svg" className={`w-6 h-6 transition-all group-hover:scale-110 group-hover:rotate-45 ${props.themeChosen === "Dark" ? "invert" : ""}`} alt="Appearance" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
                <div className={`text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Appearance
                </div>
                <div className={`text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    Customize themes and visual settings
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

export function NotificationsOption( props: any ){
    return (
        <div
            className={`group relative flex items-center gap-4 mx-2 mt-2 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {
                props.setPressNotifications(true)
                props.setPressAccount(false)
                props.setPressProfile(false)
                props.setPressAppearance(false)
                props.setPressedSettings(false)
                props.setPressPrivacy(false)
                props.setProfilePicPrivPress(false)
            }}
        >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20" : "bg-gray-200 group-hover:bg-gray-300"}`}>
                <img src="./notification_1.png" className={`w-6 h-6 transition-all group-hover:scale-110 group-hover:rotate-12 ${props.themeChosen === "Dark" ? "invert" : ""}`} alt="Notifications" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
                <div className={`text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Notifications
                </div>
                <div className={`text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    Control message and sound alerts
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

export function LogOutOption( props: any ){

    const [logOut, setLogOut] = useState(false)

    useEffect(() => {
        if(logOut === true) {
            props.logOutNow();
            props.setLoggedIn(false);
        }
    }, [logOut])

    return (
        <div
            className="group relative flex items-center gap-4 mx-2 mt-6 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-red-500/20 hover:shadow-xl hover:shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] border border-transparent hover:border-red-500/30"
            onClick={async () => {setLogOut(true); console.log("logging out from settings")}}
        >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl transition-all bg-red-500/10 group-hover:bg-red-500/20">
                <img src="exitIcon.png" className="w-6 h-6 opacity-90 transition-all group-hover:scale-110" alt="Log out" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
                <div className="text-lg font-semibold text-red-500 tracking-tight">
                    Log out
                </div>
                <div className="text-sm text-red-400 font-medium">
                    Sign out of your account
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}



export function SearchBar( props : any ) {

    return (
        <div className={`absolute left-0 top-[6%] h-[14%] w-full ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
            <div className={`relative left-[2%] top-[10%] w-[96%] h-[50%] rounded-xl border ${props.themeChosen === "Dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-100 border-gray-300"} transition-all focus-within:border-[#3B7E9B] focus-within:ring-2 focus-within:ring-[#3B7E9B]/20`}>
                <div className="relative top-0 left-0 h-full w-full flex flex-row">
                    <div className='relative left-0 top-0 w-[15%] h-full flex flex-col justify-center items-center'>
                        <img className='absolute max-w-[50px] max-h-[50px] w-[60%] h-[60%] opacity-70' src={`${props.themeChosen === "Dark" ? "/searchIcon2-1.png" : "/searchIcon_black.png"} `}></img>
                    </div>
                    <div className='relative left-[2%] top-0 w-[86%] h-full flex flex-col justify-center items-start'>
                        <input className={`absolute left-0 top-0 w-full h-full outline-none bg-transparent px-2 overflow-x-auto text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? 'text-white placeholder:text-gray-400' : 'text-gray-800 placeholder:text-gray-500'}`}
                            value={props.searchedSetting}
                            placeholder="Search settings..."
                            onChange={async (e) => {
                                props.setSearchedSetting(e.target.value)
                            }}
                        >
                        </input>
                    </div>
                </div>
            </div>
        </div>
    );
}