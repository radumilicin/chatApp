import {useState, useRef, useEffect} from 'react'

export default function SettingsView(props) {
 
    const [searchedSettings, setSearchedSetting] = useState("");

    return (
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] border-y-4 ${props.themeChosen === "Dark" ? "bg-[#323232] bg-opacity-60 border-[#0D1317] " : "bg-gray-300 border-gray-400 shadow-lg border-2"} flex flex-col`}>
            <div className={`absolute left-0 top-[1%] h-[5%] w-full flex flex-row ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : "bg-opacity-50 bg-transparent"}`}>
                <div className={`relative indent-[30px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-gray-500 ${props.themeChosen === "Dark" ? "" : "hover:bg-opacity-30"} hover:rounded-xl hover:cursor-pointer`} 
                        onClick={() => {
                            props.setPressedSettings(false); 
                            props.setPressProfile(false); 
                            props.setProfilePicPrivPress(false); 
                            props.setStatusPrivPress(false);
                            props.setDisappearingMessagesPressed(false);
                            props.setBlockedContactsPressed(false);
                        }}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="justify-center items-center w-6 h-6 aspect-square"></img>
                    </div>
                <div className={`relative indent-[20px] left-[2%] w-[40%] text-xl xl:text-2xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-slate-700"} font-sans flex flex-row justify-start items-center`}>Settings</div>
            </div>

            <SearchBar searchedSetting={searchedSettings} setSearchedSetting={setSearchedSetting} themeChosen={props.themeChosen}></SearchBar>

            <div className={`absolute left-0 w-full top-[20%] h-[80%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : "bg-opacity-50 bg-transparent"}`}>
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <CurrUserDiv curr_user={props.curr_user} users={props.users} images={props.images} themeChosen={props.themeChosen} setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile} 
                                setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications} setPressAppearance={props.setPressAppearance} 
                                setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress}></CurrUserDiv>
                    <AccountOption setPressedSettings={props.setPressedSettings} setPressProfile={props.setPressProfile} setPressAccount={props.setPressAccount} setPressNotifications={props.setPressNotifications} 
                        setPressAppearance={props.setPressAppearance} setPressPrivacy={props.setPressPrivacy} setProfilePicPrivPress={props.setProfilePicPrivPress} themeChosen={props.themeChosen}></AccountOption>
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
        <div className={`relative flex flex-row justify-center items-center left-[2%] w-[96%] h-[15%] rounded-xl hover:bg-gray-500 
            ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:cursor-pointer`} onClick={() => {
                            props.setPressedSettings(false); 
                            props.setPressProfile(true); 
                            props.setProfilePicPrivPress(false); 
                            props.setStatusPrivPress(false);
                            props.setDisappearingMessagesPressed(false);
                            props.setBlockedContactsPressed(false);
                        }}>
            <div className="relative flex flex-row w-[25%] h-[70%] justify-center items-center">
                {imageData.data !== "" ? <img src={`data:image/jpg;base64,${imageData.data}`} className="flex w-14 h-14 rounded-full" onClick={() => {}}></img>
                                               : <img src="./profilePic2.png" className="flex w-14 h-14 rounded-full"></img>
                }
            </div>
            <div className="relative flex flex-col w-[75%] h-full">
                {!user && <div className="relative flex flex-row h-[50%]"></div>} 
                {user && <div className={`relative flex flex-row justify-start items-end h-[50%] text-base xl:text-lg font-medium ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"}`}>{user.username}</div>}
                {user && <div className={`relative flex flex-row justify-start items-start h-[50%] text-xs lg:text-sm xl:text-base font-medium ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"}`}>{user.about}</div>}
            </div>
        </div>
    );
}

export function PrivacyOption(props: any) {
    return (
        <div className={`relative flex flex-row left-[2%] top-[5%] w-[96%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:cursor-pointer`} onClick={() => {
            props.setPressNotifications(false)
            props.setPressAccount(false)
            props.setPressProfile(false)
            props.setPressAppearance(false)
            props.setPressedSettings(false)
            props.setPressPrivacy(true)
        }}>
            <div className="relative flex flex-row w-[15%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "lock_white_nobg.png" : "lock-black-nobg.png"}`} className="w-[28px] h-[28px] lg:w-8 lg:h-8 xl:w-10 xl:h-10"></img>
            </div>
            <div className="relative flex flex-col w-[85%] h-full">
                <div className={`relative flex flex-row h-[50%] text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} font-medium justify-start items-end`}>Privacy</div>
                <div className={`relative flex flex-row h-[50%] text-xs lg:text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} justify-start items-start`}>Blocked contacts, disappearing messages</div>
            </div>
        </div>
    );

}

export function AccountOption( props: any ){
    return (
        <div className={`relative flex flex-row left-[2%] top-[5%] w-[96%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:cursor-pointer`}>
            <div className="relative flex flex-row w-[15%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "key-icon.png" : "key_icon_black.png"}`} className="w-[24px] h-[24px] lg:w-[28px] lg:h-[28px] xl:w-8 xl:h-8"></img>
            </div>
            <div className="relative flex flex-col w-[85%] h-full">
                <div className={`relative flex flex-row h-[50%] text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"}  font-medium justify-start items-end`}>Account</div>
                <div className={`relative flex flex-row h-[50%] text-xs lg:text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} justify-start items-start`}>Account info</div>
            </div>
        </div>
    );
}

export function AppearanceOption( props: any ){
    return (
        <div className={`relative flex flex-row left-[2%] top-[5%] w-[96%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:cursor-pointer`} onClick={() => {
            props.setPressNotifications(false)
            props.setPressAccount(false)
            props.setPressProfile(false)
            props.setPressAppearance(true)
            props.setPressedSettings(false)
            props.setPressPrivacy(false)
            props.setProfilePicPrivPress(false)
        }}>
            <div className="relative flex flex-row w-[15%] h-full justify-center items-center">
            <img src={`${props.themeChosen === "Dark" ? "color_palette_nobg.png" : "color-palette-black-icon.png"}`} className={`${props.themeChosen === "Dark" ? "w-16 h-16" : "w-14 h-14"}`}></img>
            </div>
            <div className="relative flex flex-col w-[85%] h-full">
                <div className={`flex flex-row h-[50%]  text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} font-medium items-end`}>Appearance</div>
                <div className={`flex flex-row h-[50%] text-xs lg:text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} justify-start items-start`}>Fonts, Themes</div>
            </div>
        </div>
    );
}

export function NotificationsOption( props: any ){
    return (
        <div className={`relative flex flex-row left-[2%] top-[5%] w-[96%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:cursor-pointer`} onClick={() => {
                            props.setPressNotifications(true)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(false)
                            props.setPressPrivacy(false)
                            props.setProfilePicPrivPress(false)
                        }}>
            <div className="relative flex flex-row w-[15%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "bell-icon.png" : "bell-icon-black-nobg.png"}`} className="w-[28px] h-[28px] lg:w-[32px] lg:h-[32px] xl:w-8 xl:h-8"></img>
            </div>
            <div className="relative flex flex-col w-[85%] h-full">
                <div className={`flex flex-row h-[50%] text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-900"} font-medium items-end`}>Notifications</div>
                <div className={`flex flex-row h-[50%] text-xs lg:text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"} justify-start items-start`}>Message notifications</div>
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
        <div className={`relative flex flex-row left-[2%] top-[5%] w-[96%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:cursor-pointer`} onClick={async () => {setLogOut(true); console.log("logging out from settings")}}>
            <div className={`relative flex flex-row w-[15%] h-full justify-center items-center`}>
                <img src="exitIcon.png" className="w-[28px] h-[28px] lg:w-[32px] lg:h-[32px] xl:w-8 xl:h-8"></img>
            </div>
            <div className={`relative flex flex-col w-[85%] h-full text-red-500 justify-center text-base lg:text-lg xl:text-xl`}> Log out </div>
        </div>
    );
}



export function SearchBar( props : any ) {

    return (
        <div className={`absolute left-0 top-[6%] h-[14%] w-full ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : "bg-opacity-50 bg-transparent"}`}>
            <div className={`relative left-[2%] top-[10%] w-[96%] h-[50%] rounded-2xl border-[2px] ${props.themeChosen === "Dark" ? "bg-[#0D1317] border-[#57CC99] text-white" : "bg-gray-500 bg-opacity-60 border-gray-500 text-black"}`}>
                <div className="relative top-0 left-0 h-full w-full flex flex-row">
                    <div className='relative left-0 top-0 w-[15%] h-full flex flex-col justify-center items-center'>
                        <img className='absolute max-w-[50px] max-h-[50px] w-[60%] h-[60%]' src="/searchIcon2-1.png"></img>
                    </div>
                    <div className='relative left-[2%] top-0 w-[86%] h-full flex flex-col justify-center items-start indent-2'>
                        <input className={`absolute left-0 top-0 w-full h-full outline-none bg-transparent overflow-x-auto text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? 'text-white placeholder:text-white' : 'text-gray-600 placeholder:text-gray-600'}`} 
                            value={props.searchedSetting}
                            placeholder="Search for a setting.."
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