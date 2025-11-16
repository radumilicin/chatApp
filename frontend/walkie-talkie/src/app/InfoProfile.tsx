import react, {useState, useEffect, useRef} from 'react'
import { GrUserAdmin } from "react-icons/gr";
import { CiCircleRemove } from "react-icons/ci";

export default function ProfileInfo( props ) {

    const [nameChangeGroup, setNameChangeGroup] = useState(false);
    const [nameGroup, setNameGroup] = useState('')
    const oldNameGroup = useRef(nameGroup)
    const contacts = useRef(props.contacts)
    const contactNow = useRef(props.contact)
    const [onProfilePic, setHoverStatusProfilePic] = useState(false)
    const [descriptionPressed, setDescriptionPressed] = useState(false)
    const [description, setDescription] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    const divRef = useRef<HTMLDivElement>(null);

    const setDescriptionPressedAsync = async (val) => {
        setDescriptionPressed(val)
    }
    
    const setDescriptionAsync = async (val) => {
        setDescription(val)
    }

    const settingGroupName = async (val) => {
        setNameGroup(val)
    }

    const settingOppositeNameChangeGroup = async () => {
        setNameChangeGroup(!nameChangeGroup)
    }

    const setIsAdminAsync = async (val: boolean) => {
        setIsAdmin(val)
    }

    useEffect(() => {
        if(props.contact.is_group === true) {
            // console.log("Changing group name after change in profile")
            settingGroupName(props.contact.group_name)
            setDescriptionAsync(props.contact.group_description)
            if(props.curr_user in props.contact.admins) setIsAdminAsync(true)
            else setIsAdminAsync(false)
        } else {
            setDescriptionAsync(getUser(props.contact).about)
        }
    }, [props.contact])

    useEffect(() => {
        console.log("Fetching contacts after entering in DB")
        var changed_contact = props.contacts.find((kontakt) => {return kontakt.id === contactNow.current.id})

        // console.log("changed contact = " + JSON.stringify(changed_contact) + "\nprev contact = " + JSON.stringify(props.contact))

        const settingContact = async () => {
            props.setCurrContact(changed_contact)
        }

        settingContact()

        // console.log("current contact after update " + JSON.stringify(props.contact))
    }, [props.contacts])

    useEffect(() => {
        function handleOutsideClick(event) {
            if (divRef.current && !divRef.current.contains(event.target)) {
                setNameChangeGroup(false)
            }
        } 

        document.addEventListener("mousedown", handleOutsideClick)

        return () => document.removeEventListener("mousedown", handleOutsideClick)
    }, [])

    function getImage(contact: any) {
        // console.log("in get image contact = " + JSON.stringify(contact))
        if(contact === null || contact === undefined) {
            return {data: ""}
        }
        console.log("in get Image.. get contact = " + JSON.stringify(contact))
        if(!contact.is_group) {
            const image = props.images.find((image: any) => (image.user_id === contact.sender_id && contact.sender_id !== props.curr_user) || 
                                                            (image.user_id === contact.contact_id && contact.contact_id !== props.curr_user));
            return image || { data: "" }; // Ensure we return a fallback value
        } else {
            const image = props.images.find((image: any) => image.id === contact.group_pic_id);
            return image || { data: "" }; // Ensure we return a fallback value
        }
    }

    function getNameContact(contact: any) {
        if(contact === null || contact === undefined) return ""
        if(contact.is_group === true){
            // console.log("contact name = " + JSON.stringify(contact.group_name))
            return contact.group_name 
        } else {
            return props.users.find((user) => { return contact.contact_id === user.id}).username
        }
    }

    function getUser(contact: any) {
        if(contact === null || contact === undefined) return {data: ""}
        // console.log("Is contact group or not: " + contact.is_group)
        if(contact.is_group === false){
            return props.users.find((id) => { return id.id === contact.contact_id})   
        }
    }

    async function changeGroupName(contact: any, newName: string) {
        if((contact !== null || contact !== undefined) && contact.is_group === true){
            let message = {
                id: contact.id,
                newName: newName
            }

            const requestParams = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            }

            try {
                await fetch('http://localhost:3002/changeGroupName', requestParams)
                await props.fetchContacts()
            } catch(error) {
                console.error(error)
            }
        }
    }

    async function changeGroupDescription(desc : string) {
        let group_id = null
        if(props.contact.is_group === true) group_id = props.contact.id
        else return

        const msg = {
            group_id: group_id,
            description: desc,
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
        };

        console.log("Before sending POST request to server to change profile pic")
        const response = await fetch(`http://localhost:3002/changeGroupDescription`, requestOptions)
        if(response.status === 200){
            await props.fetchContacts()
        } else {
            console.log("Could not change group description")
        }
    }

    async function changeProfilePic(base64Img) {
        let group_id = null
        if(props.contact.is_group === true) group_id = props.contact.id
        else return

        const msg = {
            group_id: group_id,
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
            await props.fetchUsers()
            await props.fetchImages()
            await props.fetchContacts()

            console.log("images = " + JSON.stringify(props.images))

            // const img = props.images.find((img) => { return img.id === msg.profile_pic_id }) 
            // console.log("profile pic id = " + JSON.stringify(img.id))
            // update images here 
            // const response2 = await fetch(`http://localhost:3002/putProfilePic?user=${props.curr_user}`)
        }
    }

    return (
        <div className={`relative top-[5%] left-[8%] w-[58%] h-[90%] ${props.themeChosen === "Dark" ? "bg-[#323232] bg-opacity-60 border-[#0D1317] " : "bg-gray-300 border-gray-400 shadow-lg border-2"} border-2 border-[#0D1317] rounded-r-xl flex-col overflow-y-scroll scrollbar-hidden`}>
            <div className={`relative left-0 h-[60%] w-[full] flex-col ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : ""} `}>
                <div className="relative left-0 flex h-[15%] w-full flex-row items-center">
                    <div className="flex h-full w-[10%] items-center justify-center" onClick={() => props.setProfileInfo(false)}>
                        <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full transition-colors hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-30" : "hover:bg-opacity-40"} cursor-pointer`}>
                            <img
                                src={`${props.themeChosen === "Dark" ? "./xicon-white.png" : "./xicon.png"}`}
                                alt="Close"
                                className="w-4 h-4 xl:w-5 xl:h-5 object-contain"
                            />
                        </div>
                    </div>
                    <div className={`h-full flex w-[30%] flex-col justify-center items-start ${props.themeChosen === "Dark" ? "text-white" : "text-black"}  font-semibold text-lg xl:text-xl 2xl:text-2xl font-sans`}>
                        Contact info
                    </div>
                </div>
                <div className="relative flex flex-col h-[60%] w-[6/10] items-center justify-center">
                    <div className="relative flex h-full max-w-[50%] items-center justify-center rounded-full"
                        onMouseEnter={() => {setHoverStatusProfilePic(true); console.log("On profile pic")}}
                        onMouseLeave={() => {setHoverStatusProfilePic(false); console.log("out of profile pic")}}
                    >
                        {/* Profile Picture */}
                        {((props.contact !== undefined && props.contact !== null) && getImage(props.contact).data !== "") ? (
                            <img
                                src={getImage(props.contact).data.startsWith('data:image') 
                                    ? `${getImage(props.contact).data}` 
                                    : `data:image/jpg;base64,${getImage(props.contact).data}`}
                                className={`cursor-pointer rounded-full max-w-[100%] max-h-[80%]`}
                            />
                        ) : (
                            <img
                                src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "./userProfile2.png"}`}
                                className={`cursor-pointer rounded-full max-w-[100%] max-h-[80%]`}
                            />
                        )}

                        {/* Input Overlaid on Top of the Image */}
                        {/* {(props.contact !== null && onProfilePic === true && props.contact.is_group === true) && ( */}
                            {isAdmin && <input
                                type="file"
                                accept="image/*"
                                className="absolute top-0 left-0 w-full h-full z-40 cursor-pointer opacity-0"
                                onClick={() => {console.log("File input clicked")}}
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
                                                base64Image = base64Image.replace(
                                                    base64Regex,
                                                    ""
                                                );
                                            }
                                            console.log(
                                                "Base64 Image (stripped):",
                                                base64Image
                                            );
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
                            />}
                        {/* )} */}
                    </div>
                </div>

                <div className="relative flex flex-col h-[25%] items-center">
                    <div ref={divRef} className="absolute flex flex-row w-[60%] h-[60%] items-center justify-center">
                        {(props.contact !== undefined || props.contact !== null) ? (nameChangeGroup === true ? 
                            (<input value={nameGroup} className={`flex flex-row justify-center items-center text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? "text-white" : "text-black" } font-medium font-sans h-full w-full outline-none overflow-x-auto border-b-2 bg-transparent border-green-800`} 
                                onChange={(e) => {
                                    settingGroupName(e.target.value)
                                    console.log("input = " + nameGroup)
                                }} onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        // change the group name in the DB
                                        if(oldNameGroup.current !== nameGroup) {
                                            changeGroupName(props.contact, nameGroup)
                                            setNameChangeGroup(false)
                                            oldNameGroup.current = nameGroup
                                        }
                                    }
                                }} placeholder={getNameContact(props.contact)}></input>) 
                            : 
                            <div className={`flex flex-row justify-center items-center text-lg lg:text-xl 2xl:text-2xl ${props.themeChosen === "Dark" ? "text-white" : "text-black"}  font-medium font-sans h-full w-full`}>{getNameContact(props.contact)}</div>) 
                            : <div className="flex flex-row justify-center items-center text-lg text-black font-medium font-sans h-full w-full"></div>}
                        <div className="absolute flex flex-row justify-center items-center text-lg text-black font-medium font-sans h-full left-[80%] w-[20%] hover:cursor-pointer" onClick={() => {(settingOppositeNameChangeGroup())}}>
                            {((props.contact !== undefined || props.contact !== null) && props.contact.is_group === true) 
                                ? <img src={`${props.themeChosen === "Dark" ? "./edit_white.png" : "./editIcon.png"}`} className="flex text-lg text-black font-medium font-sans left-[10%] h-[30%] aspect-square" onClick={() => {}}></img>
                                : <></>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <AboutProfile setDescriptionPressedAsync={setDescriptionPressedAsync} descriptionPressed={descriptionPressed} contact={props.contact}
                            description={description} setDescriptionAsync={setDescriptionAsync} changeGroupDescription={changeGroupDescription} users={props.users} getUser={getUser} themeChosen={props.themeChosen}>
            </AboutProfile>
            {props.contact.is_group === true && <Members users={props.users} images={props.images} contact={props.contact} contacts={props.contacts} setAddToGroup={props.setAddToGroup} getUser={getUser} fetchContacts={props.fetchContacts} themeChosen={props.themeChosen}></Members>}
            {props.contact.is_group === true && <OptionsGroup curr_user={props.curr_user} contact={props.contact} users={props.users} contacts={props.contacts} fetchContacts={props.fetchContacts} getUser={getUser} setCurrContact={props.setCurrContact} setProfileInfo={props.setProfileInfo} themeChosen={props.themeChosen}></OptionsGroup>}
            {props.contact.is_group === false && <OptionsChat curr_user={props.curr_user} contact={props.contact} users={props.users} contacts={props.contacts} fetchContacts={props.fetchContacts} getUser={getUser} setCurrContact={props.setCurrContact} setProfileInfo={props.setProfileInfo} themeChosen={props.themeChosen}></OptionsChat>}
        </div>
    );
}

function AboutProfile(props) {

    const prevAbout = useRef('')
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Event listener for clicks
        const handleClickOutside = (event) => {
            console.log("divRef.current:", divRef.current);
            console.log("event.target:", event.target);
            if (divRef.current && !divRef.current.contains(event.target)) {
                props.setDescriptionPressedAsync(false) // set menu press to false
                console.log("outside press")
            }
        };

        // listens if the whole document was clicked and if it is then see if it was then
        // check if the click happened outside
        // Attach event listener to the document
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup function to remove the listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if(props.contact !== null){
            if(props.contact.is_group === true){
                prevAbout.current = props.contact.group_description
            } else {
                prevAbout.current = props.users.find((user) => {return user.id === props.contact.contact_id}).about
            }
        }
    }, [props.contact])

    

    return (
        <div className="relative left-0 top-[0%] h-[15%] w-full flex flex-col justify-center bg-opacity-30 border-y-2 border-gray-500">
                <div className={`flex text-lg lg:text-xl 2xl:text-2xl ${props.themeChosen === "Dark" ? "text-white" : "text-black" } indent-[30px] h-[60%] w-full font-medium font-sans items-center`}>About</div>
                <div ref={divRef} className="flex flex-row text-md text-white indent-[30px] h-[40%] w-full font-sans items-center justify-center">
                    <div className={`flex flex-row left-[5%] w-[90%] h-full ${props.themeChosen === "Dark" ? "text-white" : "text-black" } hover:cursor-pointer items-start justify-start text-base lg:text-lg xl:text-xl ${props.descriptionPressed ? 'ml-6' : ''}`} onClick={() => {props.contact.is_group ? props.setDescriptionPressedAsync(true) : {}}}>
                        {
                            (props.contact !== null) ? 
                                (props.contact.is_group === true && props.descriptionPressed === false ? ((props.contact.group_description === '') ? 'Add group description' 
                                                                                                            : props.contact.group_description) 
                                                                 : (props.contact.is_group === false) ? props.getUser(props.contact).about : '') : ''}
                        {
                            (props.contact !== null) ? 
                                ((props.contact.is_group === true && props.descriptionPressed === true) ? 
                                    <input placeholder="Add description to group"
                                           value={props.description}
                                           className={`w-[98%] outline-none bg-transparent border-b-2 border-green-700 ${props.themeChosen === "Dark" ? "text-gray-300" : "text-black" } font-sans text-base lg:text-lg xl:text-xl indent-[5px]`}
                                           onChange={(e) => {
                                              props.setDescriptionAsync(e.target.value)
                                              console.log("Description: " + props.description)
                                           }}
                                           onKeyDown={(e) => {
                                                if(e.key === 'Enter' || e.key === 'Escape') {
                                                    // change the group name in the DB
                                                    // if(prevAbout.current !== props.description) {
                                                    console.log("input has been submitted")
                                                    props.changeGroupDescription(props.description)
                                                    props.setDescriptionPressedAsync(false)
                                                    prevAbout.current = props.description
                                                    // }
                                                }
                                           }}
                                    >
                                    </input> : <></>) : <></>
                        }
                    </div>
                    {<div className="w-[10%] h-full">
                        {props.contact.is_group === true && <img src={`${props.themeChosen === "Dark" ? "./edit_white.png" : "editIcon.png"}`}
                            className="flex text-lg text-black font-medium font-sans left-[10%] h-5 w-5 hover:cursor-pointer overflow-x-scroll aspect-square" 
                            onClick={() => {
                                if(props.descriptionPressed) props.setDescriptionPressedAsync(false)
                                else props.setDescriptionPressedAsync(true)
                            }}></img>}
                    </div>}
                </div>
            </div>
    );
}

function Members(props) {

    const [pressed, setPressed] = useState([])
    const [userToAddAsAdmin, setUserToAddAsAdmin] = useState(-1)
    
    const updatePressedAsync = async (arr : any) => {
        setPressed(arr)
    }

    const updatePressedIndex = async (idx: number) => {
        const filteredPressed = pressed.map((elem, i) => 
            i === idx ? ((elem === true) ? false : true) : false
        );
        console.log("filteredPressed after press" + JSON.stringify(filteredPressed));
        updatePressedAsync(filteredPressed);
    }

    function getUser(user_id) {
        const user = props.users.find((user) => {return user.id === user_id})
        return user || {data: ""}
    }
    
    function getProfilePic(user: any) { 
        console.log("HERE?")
        const image = props.images.find((image: any) => image.id === user.profile_pic_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    useEffect(() => {
        console.log("members = " + props.contact.members)
        if(props.contact !== null && props.contact.is_group === true) updatePressedAsync(props.contact.members.map(() => false))
    }, [props.contact])

    async function kickFromGroup(val : number) {
        console.log("curr_user = " + props.curr_user + " group_id = " + props.contact.id)
        if(props.contact !== null && props.contact.is_group === true) {
            let msg = {
                curr_user: val,
                group_id: props.contact.id
            }

            let requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            }

            const response = await fetch('http://localhost:3002/exitGroup', requestOptions)
            if(response.status === 200){
                console.log(JSON.stringify(props.getUser(val)) + " has been kicked out from the group " + props.contact.group_name)
                await props.fetchContacts()
            } else {
                console.log("Error exiting the group " + JSON.stringify(props.contact.group_name))
            }
        }
    }

    async function makeAdmin(val: number) {
        if(props.contact !== null && props.contact.is_group === true) {
            let body = {
                userToAddAsAdmin: val,
                group_id: props.contact.id,
                admins: props.contact.admins
            }

            let requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            }

            const response = await fetch(`http://localhost:3002/makeAdmin`, requestOptions);
            if(response.ok) {
                console.log("User " + userToAddAsAdmin.toString() + " successfully made admin")
                await props.fetchContacts()
            } else {
                console.log("response error: " + response.status)
            }
        }
    }

    return (
        <div className={`relative left-0 top-0 w-full flex flex-col justify-center ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : "bg-transparent" } overflow-scroll scrollbar-hide border-b-2 border-gray-500`}>
            <div className={`relative flex h-[100px] w-full flex-row hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"}`} onClick={() => { props.setAddToGroup(true); console.log("Should show list of people to add to group")}}>
                <div className={`flex w-[15%] h-full flex-row justify-center items-center`}>
                    <img src="./addFrendo.png" className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-white"></img>
                </div>
                <div className={`flex w-[85%] h-full flex-row justify-start items-center hover:cursor-pointer `}>
                    <div className="text-base lg:text-lg xl:text-xl text-green-500 font-sans font-semibold">Add member</div>
                </div>
            </div>
            {props.contact.members.map((id, idx) => (
            <div key={idx} className={`relative flex h-[100px] w-full flex-row hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} cursor-pointer items-center`} onClick={() => { updatePressedIndex(idx) }}>
                <div className={`flex w-[15%] h-full flex-row justify-center items-center`}>
                {(getProfilePic(getUser(id)).data !== "") ?
                    <img src={`data:image/jpg;base64,${getProfilePic(getUser(id)).data}`} className="w-10 h-10 xl:w-12 xl:h-12 rounded-full"></img> :
                    <img src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "./userProfile2.png"}`} className={`${props.themeChosen === "Dark" ? "w-14 h-14" : "w-12 h-12"} rounded-full`}></img>
                }
                </div>
                <div className="flex w-[70%] h-full flex-col justify-start">
                    <div className={`flex h-[50%] ${props.themeChosen === "Dark" ? "text-gray-200" : "text-gray-900"} font-sans text-base lg:text-lg font-medium items-end`}>{getUser(id).username}</div>
                    <div className={`flex h-[50%] ${props.themeChosen === "Dark" ? "text-gray-300" : "text-black"} font-sans text-sm lg:text-md items-start`}>{getUser(id).about}</div>
                </div>
                {(props.contact.admins.includes(id)) && <div className="relative flex flex-row justify-center items-center w-[12%] h-[30%] bg-green-700 rounded-xl text-white">Group admin</div>}
                {pressed[idx] == true && 
                <div className="absolute flex flex-col left-[65%] xl:left-[70%] top-[80%] w-[28%] lg:w-[25%] h-[100px] bg-gray-600 justify-center items-center rounded-md z-50">
                    <div className="relative flex flex-row w-full h-full text-white font-sans text-lg items-center justify-center hover:bg-gray-400 hover:rounded-md" onClick={() => {makeAdmin(id)}}>
                        <div className="relative flex flex-row w-[30%] h-full justify-center items-center">
                            <GrUserAdmin className="w-4 h-4 xl:w-5 xl:h-5"></GrUserAdmin>
                        </div>
                        <div className="relative flex flex-row w-[70%] h-full justify-start items-center text-sm lg:text-base xl:text-lg">
                            Make admin
                        </div>
                    </div>
                    <div className="relative w-full h-full text-white font-sans text-lg flex items-center justify-center hover:bg-gray-400 hover:rounded-md" onClick={() => {kickFromGroup(id)}}>
                        <div className="relative flex flex-row w-[30%] h-full justify-center items-center">
                            <CiCircleRemove className="w-5 h-5 xl:w-6 xl:h-6"></CiCircleRemove>
                        </div>
                        <div className="relative flex flex-row w-[70%] h-full justify-start items-center  text-sm lg:text-base xl:text-lg">
                            Remove user
                        </div> 
                    </div>
                </div>
                }
            </div>
            ))}
        </div>
    );
}

function OptionsGroup(props) {
    
    async function exitGroup() {
        console.log("curr_user = " + props.curr_user + " group_id = " + props.contact.id)
        if(props.contact !== null && props.contact.is_group === true) {
            let msg = {
                curr_user: props.curr_user,
                group_id: props.contact.id
            }

            let requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            }

            const response = await fetch('http://localhost:3002/exitGroup', requestOptions)
            if(response.status === 200){
                console.log(JSON.stringify(props.getUser(props.curr_user)) + " has exited the group " + props.contact.group_name)
                await props.fetchContacts()
            } else {
                console.log("Error exiting the group " + JSON.stringify(props.contact.group_name))
            }
        }
    }

    return (
        <div className={`relative left-0 top-[0%] w-full flex flex-col justify-center ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : "bg-transparent" } overflow-scroll scrollbar-hide`}>
            <div className="relative flex h-[150px] w-full flex-row hover:bg-slate-300 hover:bg-opacity-30" onClick={() => {exitGroup(); props.setCurrContact(null); props.setProfileInfo(false)}}>
                <div className="flex w-[15%] h-full flex-row justify-center items-center">
                    <img src="./exitIcon.png" className="w-10 h-10 xl:w-12 xl:h-12"></img>
                </div>
                <div className="flex w-[85%] h-full justify-start items-center text-base lg:text-lg xl:text-xl font-sans font-medium text-red-600 hover:cursor-pointer">Exit group</div>
            </div>
        </div>
    );
}

function OptionsChat(props) {

    async function deleteChat() {
        console.log("curr_user = " + props.contact.sender_id + " contact_id = " + props.contact.contact_id)
        if(props.contact !== null && props.contact.is_group === false) {
            let msg = {
                curr_user: props.contact.sender_id,
                contact_id: props.contact.contact_id
            }

            let requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            }

            const response = await fetch('http://localhost:3002/deleteChat', requestOptions)
            if(response.status === 200){
                console.log(JSON.stringify(props.getUser(props.contact.sender_id)) + " has deleted the chat with " + props.contact.contact_id + " with id = " + JSON.stringify(props.contact.id))
                await props.fetchContacts()
            } else {
                console.log("Error deleting chat " + JSON.stringify(props.contact.id))
            }
        }
    }

    function setCurrContactAfterChange() {
        props.setCurrContact(
            props.contacts.find((elem) => (elem.sender_id === props.contact.sender_id && elem.contact_id === props.contact.contact_id) || 
                                          (elem.contact_id === props.contact.sender_id && elem.sender_id === props.contact.contact_id))
        )
    }

    async function blockContact(status: string) {
        console.log("curr_user = " + props.contact.sender_id + " contact_id = " + props.contact.contact_id)
        if(props.contact !== null && props.contact.is_group === false) {
            let msg = {
                "curr_user": props.contact.sender_id,
                "contact_id": props.contact.contact_id,
                "status": status
            }

            let requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            }

            console.log("curr_user: " + JSON.stringify(props.contact.sender_id) + " contact_id: " + JSON.stringify(props.contact.contact_id) + " status: " + status)

            const response = await fetch('http://localhost:3002/blockContact', requestOptions)
            if(response.status === 200){
                console.log(JSON.stringify(props.getUser(props.contact.sender_id)) + " has blocked the chat with " + props.contact.contact_id + " with id = " + JSON.stringify(props.contact.id))
                await props.fetchContacts()
                setCurrContactAfterChange
            } else {
                console.log("Error blocking chat " + JSON.stringify(props.contact.id))
            }
        }
    }

    useEffect(() => {
        setCurrContactAfterChange()
    }, [props.contacts])

    return (
        <div className={`relative left-0 top-[0%] h-[25%] w-full flex-col ${props.themeChosen === "Dark" ? "bg-gray-800 bg-opacity-30" : "bg-transparent" } overflow-scroll scrollbar-hide`}>
            {props.contact.blocked === false && <div className={`relative flex flex-row w-full h-[50%] ${props.themeChosen === "Dark" ? "hover:bg-slate-300 hover:bg-opacity-10" : "hover:bg-gray-500 hover:bg-opacity-30"} hover:cursor-pointer`} onClick={() => {blockContact('block'); }}>
                <div className="flex flex-row h-full w-[15%] items-center justify-center">
                    <img src="./denied2.png" className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 aspect-square"></img>
                </div>
                <div className="flex flex-row h-full w-[85%] items-center justify-start">
                    <div className="absolute text-base lg:text-lg xl:text-xl text-red-500 font-semibold font-sans">Block user</div>
                </div>
            </div>}
            {props.contact.blocked === true && <div className={`flex flex-row w-full h-[50%] ${props.themeChosen === "Dark" ? "hover:bg-slate-300 hover:bg-opacity-10" : "hover:bg-gray-500 hover:bg-opacity-30"} hover:cursor-pointer`} onClick={() => {blockContact('unblock'); }}>
                <div className="flex flex-row h-full w-[15%] items-center justify-center">
                    <img src="./unblock2.png" className="w-10 h-10 xl:w-12 xl:h-12 aspect-square"></img>
                </div>
                <div className="flex flex-row h-full w-[85%] items-center justify-start">
                    <div className="text-base lg:text-lg xl:text-xl text-green-700 font-semibold font-sans">Unblock user</div>
                </div>
            </div>}
            <div className={`flex flex-row w-full h-[50%] ${props.themeChosen === "Dark" ? "hover:bg-slate-300 hover:bg-opacity-10" : "hover:bg-gray-500 hover:bg-opacity-30"} hover:cursor-pointer`} onClick ={() => {deleteChat(); props.setCurrContact(null); props.setProfileInfo(false)}}>
                <div className="flex flex-row h-full w-[15%] items-center justify-center">
                    <img src="./trash-icon-red.png" className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 aspect-square"></img>
                </div>
                <div className="flex flex-row h-full w-[85%] items-center justify-start">
                    <div className="text-base lg:text-lg xl:text-xl text-red-500 font-semibold font-sans">Delete chat</div>
                </div>
            </div>
        </div>
    )
}