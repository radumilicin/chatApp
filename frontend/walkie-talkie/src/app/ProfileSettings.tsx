import react, {useState, useEffect} from 'react'

export default function ProfileSettings(props) {

    const [hoveredProfilePic, setHoverProfilePic] = useState(false)
    const [currImageData, setCurrImageData] = useState({'data' : ""})

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

    useEffect(() => {
        console.log("users after profile pic change = " + JSON.stringify(props.users))
        setCurrImageData(getProfileImage())
    }, [props.users, props.images])

    useEffect(() => {
        console.log("data image changed to " + JSON.stringify(currImageData) + " at time " + new Date().toISOString())
    }, [currImageData])

    return (
        <div className="relative left-[8%] w-[30%] top-[10%] h-[80%] bg-[#7DD8C3] rounded-r-xl border-white border-2 flex flex-col">
            <div className="relative flex flex-row top-[5%] left-[15%] w-[70%] h-[45%] bg-gray-700 justify-center items-center hover:opacity-50 rounded-full" 
                onMouseEnter={() => {setHoverProfilePic(true)}} onMouseLeave={() => {setHoverProfilePic(false)}}>
                {currImageData.data !== "" ? <img src={`data:image/jpeg;base64,${currImageData.data}`} className="h-[70%] w-[70%] z-0 rounded-full" />
                                          : <img src="./profilePic2.png" className="h-[70%] w-[70%] z-0"></img>
                }
                {hoveredProfilePic ? <div className="absolute h-[70%] w-[70%] flex flex-col items-center justify-center">
                    <img src="./cameraIcon2.png" className="h-[20%] w-[30%]"></img>
                    <p className="h-[30%] w-[100%] text-black inline-block flex-row justify-center items-center">Change profile picture</p>
                </div> : <></>}
                <input 
                    type="file" accept="image/*"
                    className="absolute top-0 left-0 w-full z-10 h-full opacity-0 cursor-pointer" 
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
                                    base64Image = base64Image.replace(base64Regex, '');
                                }

                                console.log("Base64 Image (stripped):", base64Image);
                                
                                // Send the base64 image
                                changeProfilePic(base64Image);
                            };
                            reader.onerror = (error) => console.error("Error reading file:", error);
                            reader.readAsDataURL(file);
                            console.log("Started reading file");
                        } else {
                            console.log("No file selected");
                        }
                        // Reset the file input to allow re-selection
                        event.target.value = '';
                    }}
                />
            </div>
            <div className="relative flex flex-col top-[0%] left-[15%] w-[70%] h-[30%] justify-center text-black">
                <p className="text-green-600 h-[10%] text-lg font-semibold">Your name</p>
                <div className="relative w-full h-[20%] flex flex-row items-center">
                    <p className="flex flex-row w-[50%] h-full items-center text-md font-medium">{getCurrUser().username}</p>
                    <div className="left-[80%] w-[20%] h-full flex flex-row items-center justify-center hover:rounded-full hover:bg-gray-400">
                        <img src="./edit2.png" className="w-[40%] h-[50%]"></img>
                    </div>
                </div>
            </div>
        </div>
    );
}