import {useState, useRef, useEffect} from 'react'

export default function SettingsViewVertical(props) {

    const [searchedSettings, setSearchedSetting] = useState("");
    const profileSettings = ["Profile", "Account"]
    const privacySettings = ["Privacy", "Blocked contacts", "Disappearing messages", "Profile picture privacy", "Status privacy"]
    const notificationsSettings = ["Notifications", "All notifications", "Receiving notifications", "Sending notifications", "Outgoing notifications"]
    const appearanceSettings = ["Appearance", "Fonts", "Themes", "Background"]
    const logOutSettings = ["Log out"]

    const searchLower = searchedSettings.toLowerCase();
    const showProfile = searchedSettings === "" || profileSettings.some(s => s.toLowerCase().includes(searchLower));
    const showPrivacy = searchedSettings === "" || privacySettings.some(s => s.toLowerCase().includes(searchLower));
    const showNotifications = searchedSettings === "" || notificationsSettings.some(s => s.toLowerCase().includes(searchLower));
    const showAppearance = searchedSettings === "" || appearanceSettings.some(s => s.toLowerCase().includes(searchLower));
    const showLogOut = searchedSettings === "" || logOutSettings.some(s => s.toLowerCase().includes(searchLower));

    return (
        <div className={`relative left-0 top-0 w-full h-[90%] ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95 border-gray-700/50" : "bg-gradient-to-b from-gray-100 to-gray-200 border-gray-300"} backdrop-blur-lg shadow-2xl border flex flex-col overflow-y-auto no-scrollbar`}>
            <div className={`absolute left-0 top-[1%] h-[5%] w-full flex flex-row ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className={`relative left-[2%] w-[12%] text-2xl font-semibold font-sans flex flex-row justify-center items-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                        onClick={() => {
                            props.setPressedSettings(false);
                            props.setPressProfile(false);
                            props.setProfilePicPrivPress(false);
                            props.setStatusPrivPress(false);
                            props.setDisappearingMessagesPressed(false);
                            props.setBlockedContactsPressed(false);
                        }}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="justify-center items-center w-5 h-5 xss:w-6 xss:h-6 aspect-square opacity-90"></img>
                    </div>
                <div className={`relative indent-[10px] left-[2%] w-[40%] text-lg xss:text-xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent font-sans flex flex-row justify-start items-center`}>Settings</div>
            </div>

            <SearchBar searchedSetting={searchedSettings} setSearchedSetting={setSearchedSetting} themeChosen={props.themeChosen}></SearchBar>

            <div className={`absolute left-0 w-full top-[18%] h-[82%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-2">
                    {showProfile && <CurrUserDiv curr_user={props.curr_user} users={props.users} images={props.images} themeChosen={props.themeChosen} setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile}
                                setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications} setPressAppearance={props.setPressAppearance}
                                setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress}></CurrUserDiv>}
                    {showPrivacy && <PrivacyOption setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile} setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications}
                     setPressAppearance={props.setPressAppearance} setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress}
                     disappearingMessagesPeriod={props.disappearingMessagesPeriod} themeChosen={props.themeChosen}
                     ></PrivacyOption>}
                    {showNotifications && <NotificationsOption setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile} setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications}
                        setPressAppearance={props.setPressAppearance} setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress} themeChosen={props.themeChosen}></NotificationsOption>}
                    {showAppearance && <AppearanceOption setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile} setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications}
                        setPressAppearance={props.setPressAppearance} setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress} themeChosen={props.themeChosen}></AppearanceOption>}
                    {showLogOut && <LogOutOption loggedIn={props.loggedIn} logOutNow={props.logOutNow} setLoggedIn={props.setLoggedIn} themeChosen={props.themeChosen}></LogOutOption>}
                </div>
            </div>
        </div>
    );
}

export function CurrUserDiv (props: any) {

    const [imageData, setImageData] = useState({'data' : ""})
    const [user, setUser] = useState(null);

    function getProfileImage() {
        const user = props.users.find((user) => {
            return user.id === props.curr_user
        })
        const image = props.images.find((image: any) => image.id === user.profile_pic_id);
        return image || { data: "" };
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
            className={`group relative flex items-center gap-3 mx-2 px-3 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {
                props.setPressedSettings(false);
                props.setPressProfile(true);
                props.setProfilePicPrivPress(false);
            }}
        >
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20" : "bg-gray-200 group-hover:bg-gray-300"}`}>
                {imageData.data !== "" ? (
                    <img
                        src={`data:image/jpg;base64,${imageData.data}`}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${props.themeChosen === "Dark" ? "border-[#3B7E9B]/50 group-hover:border-[#3B7E9B]" : "border-gray-400 group-hover:border-gray-600"} group-hover:scale-105`}
                        alt="Profile"
                    />
                ) : (
                    <img
                        src={`${props.themeChosen === "Dark" ? "./profilePic2.png" : "profilePic_black.png"}`}
                        className="w-8 h-8 rounded-full opacity-90 transition-all group-hover:scale-105"
                        alt="Default Profile"
                    />
                )}
            </div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                {user && (
                    <>
                        <div className={`text-base xss:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight truncate`}>
                            {user.username}
                        </div>
                        <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium truncate`}>
                            {user.about}
                        </div>
                    </>
                )}
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}

export function PrivacyOption(props: any) {
    return (
        <div
            className={`group relative flex items-center gap-3 mx-2 mt-1 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {
                props.setPressNotifications(false)
                props.setPressAccount(false)
                props.setPressProfile(false)
                props.setPressAppearance(false)
                props.setPressedSettings(false)
                props.setPressPrivacy(true)
            }}
        >
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20" : "bg-gray-200 group-hover:bg-gray-300"}`}>
                <img src="./lock-icon.svg" className={`w-5 h-5 transition-all group-hover:scale-110 ${props.themeChosen === "Dark" ? "invert" : ""}`} alt="Privacy" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
                <div className={`text-base xss:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Privacy
                </div>
                <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    Blocked contacts, disappearing messages
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}

export function AccountOption( props: any ){
    return (
        <div
            className={`group relative flex items-center gap-3 mx-2 mt-1 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
        >
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20" : "bg-gray-200 group-hover:bg-gray-300"}`}>
                <img src={`${props.themeChosen === "Dark" ? "key-icon.png" : "key_icon_black.png"}`} className={`w-5 h-5 transition-all group-hover:scale-110`} alt="Account" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
                <div className={`text-base xss:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Account
                </div>
                <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    Account info
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}

export function AppearanceOption( props: any ){
    return (
        <div
            className={`group relative flex items-center gap-3 mx-2 mt-1 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
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
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20" : "bg-gray-200 group-hover:bg-gray-300"}`}>
                <img src="./appearance-icon.svg" className={`w-5 h-5 transition-all group-hover:scale-110 group-hover:rotate-45 ${props.themeChosen === "Dark" ? "invert" : ""}`} alt="Appearance" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
                <div className={`text-base xss:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Appearance
                </div>
                <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    Fonts, Themes
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}

export function NotificationsOption( props: any ){
    return (
        <div
            className={`group relative flex items-center gap-3 mx-2 mt-1 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
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
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${props.themeChosen === "Dark" ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20" : "bg-gray-200 group-hover:bg-gray-300"}`}>
                <img src="./notification_1.png" className={`w-5 h-5 transition-all group-hover:scale-110 group-hover:rotate-12 ${props.themeChosen === "Dark" ? "invert" : ""}`} alt="Notifications" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
                <div className={`text-base xss:text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Notifications
                </div>
                <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                    Message notifications
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            className="group relative flex items-center gap-3 mx-2 mt-4 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-red-500/20 hover:shadow-xl hover:shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] border border-transparent hover:border-red-500/30"
            onClick={async () => {setLogOut(true); console.log("logging out from settings")}}
        >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl transition-all bg-red-500/10 group-hover:bg-red-500/20">
                <img src="exitIcon.png" className="w-5 h-5 opacity-90 transition-all group-hover:scale-110" alt="Log out" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
                <div className="text-base xss:text-lg font-semibold text-red-500 tracking-tight">
                    Log out
                </div>
                <div className="text-xs xss:text-sm text-red-400 font-medium">
                    Sign out of your account
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}

export function SearchBar( props : any ) {
    return (
        <div className={`absolute left-0 top-[6%] h-[12%] w-full ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
            <div className={`group relative left-[2%] top-[10%] w-[96%] h-[70%] rounded-2xl overflow-hidden
                transition-all duration-300
                ${props.themeChosen === "Dark"
                    ? "border-2 border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-cyan-500/10 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                    : "border-2 border-gray-300 bg-gray-100 shadow-md focus-within:border-[#3B7E9B] focus-within:shadow-lg"}
                backdrop-blur-sm`}>
                <div className="relative top-0 left-0 h-full w-full flex flex-row">
                    <div className='relative left-0 top-0 w-[15%] h-full flex flex-col justify-center items-center'>
                        <img className={`absolute max-w-[50px] max-h-[50px] w-[60%] h-[60%] opacity-70 group-focus-within:opacity-100 group-focus-within:scale-110 transition-all`}
                        src={`${props.themeChosen === "Dark" ? "/searchIcon2-1.png" : "/searchIcon_black.png"}`}></img>
                    </div>
                    <div className='relative left-[2%] top-0 w-[86%] h-full flex flex-col justify-center items-start indent-2'>
                        <input className={`absolute left-0 top-0 w-full h-full outline-none bg-transparent overflow-x-auto text-base xss:text-lg font-medium
                            ${props.themeChosen === "Dark" ? "text-white placeholder:text-gray-400/50" : "text-black placeholder:text-gray-400"}`}
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