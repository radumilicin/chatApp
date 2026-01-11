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
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg rounded-2xl flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            <div className={`absolute left-0 top-[1%] h-[5%] w-full flex flex-row ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className={`relative left-[2%] w-[8%] text-2xl font-semibold font-sans flex flex-row justify-center items-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
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
                    <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className={`justify-center items-center w-6 h-6 aspect-square opacity-90`}></img>
                </div>
            </div>
            <div className={`absolute left-0 top-[6%] w-full h-[44%] ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent" }`}>
                <div
                    className={`relative flex flex-row top-[8%] left-[15%] w-[70%] h-80 justify-center items-center rounded-full`}
                    onMouseEnter={() => {setHoverProfilePic(true); console.log("in profile pic")}}
                    onMouseLeave={() => {setHoverProfilePic(false); console.log("out of profile pic")}}
                >
                    {currImageData.data !== "" ? (
                        <img
                            src={`data:image/jpeg;base64,${currImageData.data}`}
                            className={`w-[180px] h-[180px] md:w-[200px] md:h-[200px] lg:w-[220px] lg:h-[220px] xl:w-60 xl:h-60 z-0 rounded-full border-4 ${props.themeChosen === "Dark" ? "border-[#3B7E9B]/50" : "border-gray-400"} shadow-xl ${hoveredProfilePic ? 'blur-sm' : ""} transition-all`}
                        />
                    ) : (
                        <img src="./profilePic2.png" className={`w-[180px] h-[180px] md:w-[200px] md:h-[200px] lg:w-[220px] lg:h-[220px] xl:w-60 xl:h-60 z-0 rounded-full border-4 ${props.themeChosen === "Dark" ? "border-[#3B7E9B]/50" : "border-gray-400"} shadow-xl ${hoveredProfilePic ? 'blur-sm' : ""} transition-all`}></img>
                    )}

                    {hoveredProfilePic && (
                        <div className="absolute h-[70%] w-[70%] flex flex-col items-center justify-center z-20">
                            <img src="./camera-icon-white2.png" className="h-20 w-20" />
                            <p className="h-[30%] w-[100%] text-white font-medium text-center">
                                Change profile picture
                            </p>
                        </div>
                    )}

                    {/* Input for file upload */}
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute top-0 left-0 w-full h-full z-50 opacity-0 cursor-pointer"
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
                                        // Remove the data URL prefix
                                        base64Image = base64Image.replace(base64Regex, "");
                                    }

                                    console.log("Base64 Image (stripped):", base64Image);

                                    // Send the base64 image
                                    changeProfilePic(base64Image);
                                };
                                reader.onerror = (error) =>
                                    console.error("Error reading file:", error);
                                reader.readAsDataURL(file);
                                console.log("Started reading file");
                            } else {
                                console.log("No file selected");
                            }
                            // Reset the file input to allow re-selection
                            event.target.value = "";
                        }}
                    />
                </div>
            </div>
            <div className={`absolute flex flex-col top-[50%] left-0 w-full h-[50%] justify-center items-center ${props.themeChosen === "Dark" ? "text-gray-300 bg-gray-800 bg-opacity-30" : "text-black bg-transparent"} `}>
                <div className="absolute top-0 h-full w-full">
                    <div className="flex flex-col w-full h-full items-center"> 
                        <div className="relative flex flex-col top-[10%] w-[80%] h-[30%]">
                            <div className={`relative flex flex-row ${props.themeChosen === "Dark" ? "text-white" : "text-gray-600"} text-opacity-80 md:indent-[20px] top-[10%] left-0 w-full h-[30%] md:text-lg font-medium items-center justify-start`}>Name</div>
                            <div ref={divRef} className="relative flex flex-row top-[10%] left-0 w-full h-[40%] items-end">
                                {
                                stateUsername === "fixed" ? <p className={`flex flex-row w-[80%] h-full items-center md:indent-[20px] text-base font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-gray-800"}`}>{getCurrUser().username}</p> 
                                                        : <input className={`flex flex-row w-[80%] h-full items-center text-base font-medium outline-none border-b-2 border-black bg-transparent`}
                                                                    value={username} onChange={(e) => {
                                                                        setUsername(e.target.value)
                                                                    }}    
                                                                    onKeyDown={(e) => {
                                                                        if(e.key === "Enter"){
                                                                            changeUsername(username)
                                                                            setStateUsername("fixed")
                                                                        }
                                                                    }}></input>
                                                        
                                }
                                <div className={`flex flex-row w-[20%] h-full items-center justify-center hover:cursor-pointer`}
                                                onClick={() => {if(stateUsername === "fixed") {
                                                                    setStateUsername("input")
                                                                } else setStateUsername("fixed")
                                                                }}>
                                    <div className={`flex flex-row w-[60px] h-[40px] justify-center items-center rounded-full transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-110 active:scale-95`}>
                                        <img src={`${props.themeChosen === "Dark" ? "./edit_white.png" : "./editIcon.png"}`} className="w-[20px] h-[20px] opacity-90"></img>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div ref={divRef2} className="relative flex flex-col top-[10%] w-[80%] h-[30%]">
                            <div className={`relative ${props.themeChosen === "Dark" ? "text-white" : "text-gray-600"} text-opacity-80 md:indent-[20px] top-[10%] left-0 h-[30%] md:text-lg lg:text-xl font-medium items-center`}>About</div>
                            <div className="relative flex flex-row top-[10%] left-0 w-full h-[40%] items-end">
                                {
                                    stateAbout === "fixed" ? (
                                        <p className={`flex flex-row w-[80%] h-full items-center md:text-sm lg:text-base md:indent-[20px] font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-gray-800"} overflow-hidden whitespace-nowrap`}>{getCurrUser().about}</p>
                                    ) : (
                                        <input
                                            className="flex flex-row w-[80%] h-full items-center text-md font-medium outline-none border-b-2 border-black bg-transparent"
                                            value={about}
                                            onChange={(e) => setAbout(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    changeAbout(about);
                                                    setStateAbout("fixed");
                                                }
                                            }}
                                        />
                                    )
                                }
                                <div
                                    className={`flex flex-row w-[20%] h-full items-center justify-center hover:cursor-pointer`}
                                    onClick={() => {if(stateAbout === "fixed"){
                                                        setStateAbout("input")
                                                    } else {
                                                        setStateAbout("fixed")
                                                    }}}
                                >
                                    <div className={`flex flex-row w-[60px] h-[40px] justify-center items-center rounded-full transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-110 active:scale-95`}>
                                        <img src={`${props.themeChosen === "Dark" ? "./edit_white.png" : "./editIcon.png"}`} className="w-[20px] h-[20px] opacity-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>      
            </div>
        </div>
    );
}