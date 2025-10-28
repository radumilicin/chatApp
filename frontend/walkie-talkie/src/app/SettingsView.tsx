import {useState, useRef, useEffect} from 'react'

export default function SettingsView(props) {
 
    const [searchedSettings, setSearchedSetting] = useState("");

    return (
        <div className="relative left-[8%] w-[30%] top-[5%] h-[90%] bg-[#637081] border-black border-2 flex flex-col bg-opacity-70">
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className="relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-slate-400 hover:rounded-xl hover:cursor-pointer" onClick={() => {props.setPressedSettings(false); props.setPressProfile(false)}}>
                        <img src="/back-arrow.png" className="justify-center items-center max-h-[70%] aspect-square"></img>
                    </div>
                <div className="relative indent-[20px] left-[2%] w-[40%] text-2xl font-semibold text-white font-sans flex flex-row justify-start items-center">Settings</div>
            </div>

            <SearchBar searchedSetting={searchedSettings} setSearchedSetting={setSearchedSetting}></SearchBar>

            <div className="absolute left-0 w-full top-[20%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <CurrUserDiv curr_user={props.curr_user} users={props.users} images={props.images}></CurrUserDiv>
                    <AccountOption></AccountOption>
                    <NotificationsOption></NotificationsOption>
                    <AppearanceOption></AppearanceOption>
                    <LogOutOption loggedIn={props.loggedIn} logOutNow={props.logOutNow} setLoggedIn={props.setLoggedIn}></LogOutOption>
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
        <div className="relative flex flex-row justify-center items-center left-[2%] w-[96%] h-[15%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer">
            <div className="relative flex flex-row w-[25%] h-[70%] justify-center items-center">
                {imageData.data !== "" ? <img src={`data:image/jpg;base64,${imageData.data}`} className="flex w-20 h-20 hover:bg-gray-500 rounded-full" onClick={() => {}}></img>
                                               : <img src="./profilePic2.png" className="flex w-20 h-20 hover:bg-gray-500 rounded-full"></img>
                }
            </div>
            <div className="relative flex flex-col w-[75%] h-full">
                {!user && <div className="relative flex flex-row h-[50%]"></div>} 
                {user && <div className="relative flex flex-row items-end h-[50%] text-lg font-medium text-[#CBD4E0]">{user.username}</div>}
                {user && <div className="relative flex flex-row items-center h-[40%] text-lg font-medium">{user.about}</div>}
            </div>
        </div>
    );
}

export function AccountOption( props: any ){
    return (
        <div className="relative flex flex-row left-[2%] top-[5%] w-[96%] h-[10%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer">
            <div className="relative flex flex-row w-[15%] h-full justify-center items-center">
                <img src="key-icon.png" className="w-8 h-8"></img>
            </div>
            <div className="relative flex flex-col w-[85%] h-full">
                <div className="flex flex-row h-[50%] text-xl text-[#CBD4E0] font-medium">Account</div>
                <div className="flex flex-row h-[50%] text-lg">account info</div>
            </div>
        </div>
    );
}

export function AppearanceOption( props: any ){
    return (
        <div className="relative flex flex-row left-[2%] top-[5%] w-[96%] h-[10%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer">
            <div className="relative flex flex-row w-[15%] h-full justify-center items-center">
            <img src="color_palette_nobg.png" className="w-16 h-16"></img>
            </div>
            <div className="relative flex flex-col w-[85%] h-full">
                <div className="flex flex-row h-[50%] text-xl text-[#CBD4E0] font-medium">Appearance</div>
                <div className="flex flex-row h-[50%] text-lg">Fonts, Themes</div>
            </div>
        </div>
    );
}

export function NotificationsOption( props: any ){
    return (
        <div className="relative flex flex-row left-[2%] top-[5%] w-[96%] h-[10%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer">
            <div className="relative flex flex-row w-[15%] h-full justify-center items-center">
                <img src="bell-icon.png" className="w-8 h-8"></img>
            </div>
            <div className="relative flex flex-col w-[85%] h-full">
                <div className="flex flex-row h-[50%] text-xl text-[#CBD4E0] font-medium">Notifications</div>
                <div className="flex flex-row h-[50%] text-lg">Message notifications</div>
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
        <div className="relative flex flex-row left-[2%] top-[5%] w-[96%] h-[10%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer" onClick={async () => {setLogOut(true); console.log("logging out from settings")}}>
            <div className="relative flex flex-row w-[15%] h-full justify-center items-center">
                <img src="exitIcon.png" className="w-8 h-8"></img>
            </div>
            <div className="relative flex flex-col w-[85%] h-full text-red-500 justify-center text-xl"> Log out </div>
        </div>
    );
}



export function SearchBar( props : any ) {

    return (
        <div className="absolute left-[2%] top-[7%] w-[96%] h-[7%] rounded-2xl border-[#57CC99] border-2 bg-[#0D1317]">
            <div className="relative top-0 left-0 h-full w-full flex flex-row">
                <div className='relative left-0 top-0 w-[15%] h-full flex flex-col justify-center items-center'>
                    <img className='absolute max-w-[50px] max-h-[50px] w-[60%] h-[60%]' src="/searchIcon2-1.png"></img>
                </div>
                <div className='relative left-[2%] top-0 w-[86%] h-full flex flex-col justify-center items-start indent-2'>
                    <input className="absolute left-0 top-0 w-full h-full outline-none text-white bg-transparent overflow-x-auto text-2xl" 
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
    );
}