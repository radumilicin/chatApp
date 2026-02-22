import react, {useState, useEffect, useRef} from 'react'

export default function ProfileSettings(props) {

    const [hoveredProfilePic, setHoverProfilePic] = useState(false)
    const [currImageData, setCurrImageData] = useState({'data' : ""})
    const [username, setUsername] = useState('');
    const [stateUsername, setStateUsername] = useState('fixed')
    const [about, setAbout] = useState('');
    const [stateAbout, setStateAbout] = useState('fixed')

    // type user is either current or other (0,1)
    function getProfileImage() {
        const user = props.users.find((user) => {
            return user.id === props.curr_user
        })
        const image = props.images.find((image: any) => { return image.id === user.profile_pic_id});
        return image || { data: "" }; // Ensure we return a fallback value
    }

    function getCurrUser() {
        return props.users.find((user) => {
            return user.id === props.curr_user
        })
    }

    // should also be a call on the websocket, maybe add another parameter for extra reference
    async function changeProfilePic(base64Img) {
        const msg = {
            id: props.curr_user,
            data_img: base64Img,
            profile_pic_id: Math.floor(Math.random() * 10000000) + 5
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
        };
        console.log("Before sending POST request to server to change profile pic")
        const response = await fetch(`http://localhost:3002/putProfilePic`, requestOptions)
        if(response.status === 200){
            await props.fetchData()
            await props.fetchData2()
            await props.fetchImages()

            console.log("images = " + JSON.stringify(props.images))

            const img = props.images.find((img) => { return img.id === msg.profile_pic_id }) 
            console.log("profile pic id = " + JSON.stringify(img))
            // update images here 
            // const response2 = await fetch(`http://localhost:3002/putProfilePic?user=${props.curr_user}`)
        }
    }

    async function changeUsername(new_username) {
        const msg = {
            id: props.curr_user,
            new_username: new_username,
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
        };
        console.log("Before sending POST request to server to change profile pic")
        const response = await fetch(`http://localhost:3002/changeUsername`, requestOptions)
        if(response.status === 200){
            await props.fetchData()
        }
    }

     async function changeAbout(new_about) {
        const msg = {
            id: props.curr_user,
            new_about: new_about,
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
        };
        console.log("Before sending POST request to server to change profile pic")
        const response = await fetch(`http://localhost:3002/changeAbout`, requestOptions)
        if(response.status === 200){
            await props.fetchData()
        }
    }

    const divRef = useRef<HTMLDivElement>(null);
    const divRef2 = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Event listener for clicks
        const handleClickOutside = (event) => {
            console.log("divRef.current:", divRef.current);
            console.log("event.target:", event.target);
            if (divRef.current && !divRef.current.contains(event.target)) {
                setStateUsername("fixed") // set menu press to false
                console.log("outside press")
            }
        };
        
        const handleClickOutside2 = (event) => {
            console.log("divRef.current:", divRef2.current);
            console.log("event.target:", event.target);
            if (divRef2.current && !divRef2.current.contains(event.target)) {
                setStateAbout("fixed") // set menu press to false
                console.log("outside press")
            }
        };

        // listens if the whole document was clicked and if it is then see if it was then
        // check if the click happened outside
        // Attach event listener to the document
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("mousedown", handleClickOutside2);

        // Cleanup function to remove the listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("mousedown", handleClickOutside2);
        };
    }, []);

    useEffect(() => {
        console.log("users after profile pic change = " + JSON.stringify(props.users))
        setCurrImageData(getProfileImage())
        setUsername(getCurrUser().username)
        setAbout(getCurrUser().about)
    }, [props.users, props.images])

    useEffect(() => {
        console.log("data image changed to " + JSON.stringify(currImageData) + " at time " + new Date().toISOString())
    }, [currImageData])

    return (
        <div className={`shrink-0 w-[30%] min-w-[400px] h-full ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            {/* Header */}
            <div className="relative w-full pt-4 px-4 pb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                            onClick={() => {
                                props.setPressPrivacy(false)
                                props.setPressNotifications(false)
                                props.setPressAccount(false)
                                props.setPressProfile(false)
                                props.setPressAppearance(false)
                                props.setPressedSettings(false)
                                props.setProfilePicPrivPress(false)
                                props.setStatusPrivPress(false)
                                props.setDisappearingMessagesPressed(false)
                                props.setBlockedContactsPressed(false)
                            }}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="w-6 h-6 aspect-square opacity-90" alt="Back" />
                    </div>
                    <h1 className={`text-2xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent`}>
                        Profile Settings
                    </h1>
                </div>
            </div>

            {/* Profile Picture Section */}
            <div className="relative w-full flex flex-col items-center justify-center py-8">
                <div
                    className="relative flex items-center justify-center group/profile"
                    onMouseEnter={() => {setHoverProfilePic(true); console.log("in profile pic")}}
                    onMouseLeave={() => {setHoverProfilePic(false); console.log("out of profile pic")}}
                >
                    {/* Glowing ring effect around profile picture */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-purple-500/30
                        blur-xl group-hover/profile:blur-2xl transition-all duration-500 scale-110 animate-pulse" />

                    {/* Secondary glow ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-300/20 via-transparent to-purple-300/20
                        blur-lg transition-all duration-300 scale-105" />

                    {currImageData.data !== "" ? (
                        <img
                            src={`data:image/jpeg;base64,${currImageData.data}`}
                            className={`relative w-40 h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-52 xl:h-52 z-10 rounded-full
                                border-4 ${props.themeChosen === "Dark" ? "border-cyan-400/50" : "border-gray-400"}
                                shadow-2xl shadow-cyan-500/20
                                group-hover/profile:border-cyan-300 group-hover/profile:shadow-cyan-400/40
                                ${hoveredProfilePic ? 'blur-sm' : ""} transition-all duration-300`}
                            alt="Profile"
                        />
                    ) : (
                        <img
                            src="./profilePic2.png"
                            className={`relative w-40 h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-52 xl:h-52 z-10 rounded-full
                                border-4 ${props.themeChosen === "Dark" ? "border-cyan-400/50" : "border-gray-400"}
                                shadow-2xl shadow-cyan-500/20
                                group-hover/profile:border-cyan-300 group-hover/profile:shadow-cyan-400/40
                                ${hoveredProfilePic ? 'blur-sm' : ""} transition-all duration-300`}
                            alt="Default Profile"
                        />
                    )}

                    {hoveredProfilePic && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-2">
                            <img src={`${props.themeChosen === "Dark" ? "./camera-white.png" : `${currImageData.data ? './camera-white.png' : './camera.png'}`}`} className="h-16 w-16" alt="Camera" />
                            <p className={`font-medium text-sm text-center px-4 ${props.themeChosen === "Dark" ? "text-white" : `${currImageData.data ? 'text-white' : 'text-gray-900'}`}`}>
                                Change profile picture
                            </p>
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 z-50 opacity-0 cursor-pointer"
                        onChange={(event) => {
                            console.log("File input triggered");
                            const file = event.target.files[0];
                            if (file) {
                                console.log("File selected:", file.name);
                                const reader = new FileReader();
                                console.log("FileReader created");
                                reader.onload = (e) => {
                                    console.log("File loaded");
                                    let base64Image = e.target.result as string;
                                    const base64Regex = /^data:image\/[a-zA-Z]+;base64,/;
                                    if (base64Regex.test(base64Image)) {
                                        base64Image = base64Image.replace(base64Regex, "");
                                    }
                                    console.log("Base64 Image (stripped):", base64Image);
                                    changeProfilePic(base64Image);
                                };
                                reader.onerror = (error) =>
                                    console.error("Error reading file:", error);
                                reader.readAsDataURL(file);
                                console.log("Started reading file");
                            } else {
                                console.log("No file selected");
                            }
                            event.target.value = "";
                        }}
                    />
                </div>
            </div>

            {/* User Information Section */}
            <div className={`flex-1 w-full px-8 pb-8 ${props.themeChosen === "Dark" ? "text-gray-300" : "text-gray-800"}`}>
                <div className="flex flex-col gap-8">
                    {/* Name Section */}
                    <div className="flex flex-col gap-2">
                        <label className={`text-sm xl:text-base font-medium ${props.themeChosen === "Dark" ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "text-gray-600 bg-transparent"} uppercase tracking-wide`}>
                            Name
                        </label>
                        <div ref={divRef} className="flex items-center gap-3">
                            {stateUsername === "fixed" ? (
                                <p className={`flex-1 text-base xl:text-lg font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-gray-800"} overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
                                    {getCurrUser().username}
                                </p>
                            ) : (
                                <input
                                    className={`flex-1 text-base xl:text-lg font-medium outline-none border-b-2 ${props.themeChosen === "Dark" ? "border-[#3B7E9B] text-white" : "border-gray-800 text-gray-800"} bg-transparent pb-1`}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={(e) => {
                                        if(e.key === "Enter"){
                                            changeUsername(username)
                                            setStateUsername("fixed")
                                        }
                                    }}
                                    autoFocus
                                />
                            )}
                            <button
                                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-110 active:scale-95`}
                                onClick={() => {
                                    if(stateUsername === "fixed") {
                                        setStateUsername("input")
                                    } else {
                                        setStateUsername("fixed")
                                    }
                                }}
                            >
                                <img
                                    src={`${props.themeChosen === "Dark" ? "./edit_white.png" : "./editIcon.png"}`}
                                    className="w-5 h-5 opacity-90"
                                    alt="Edit"
                                />
                            </button>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="flex flex-col gap-2">
                        <label className={`text-sm xl:text-base font-medium ${props.themeChosen === "Dark" ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "text-gray-600 bg-transparent"} uppercase tracking-wide`}>
                            About
                        </label>
                        <div ref={divRef2} className="flex items-center gap-3">
                            {stateAbout === "fixed" ? (
                                <p className={`flex-1 text-base xl:text-lg font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-gray-800"} overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
                                    {getCurrUser().about}
                                </p>
                            ) : (
                                <input
                                    className={`flex-1 text-base xl:text-lg font-medium outline-none border-b-2 ${props.themeChosen === "Dark" ? "border-[#3B7E9B] text-white" : "border-gray-800 text-gray-800"} bg-transparent pb-1`}
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            changeAbout(about);
                                            setStateAbout("fixed");
                                        }
                                    }}
                                    autoFocus
                                />
                            )}
                            <button
                                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-110 active:scale-95`}
                                onClick={() => {
                                    if(stateAbout === "fixed"){
                                        setStateAbout("input")
                                    } else {
                                        setStateAbout("fixed")
                                    }
                                }}
                            >
                                <img
                                    src={`${props.themeChosen === "Dark" ? "./edit_white.png" : "./editIcon.png"}`}
                                    className="w-5 h-5 opacity-90"
                                    alt="Edit"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}