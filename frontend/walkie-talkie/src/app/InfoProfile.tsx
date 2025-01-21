import react, {useState, useEffect, useRef} from 'react'

export default function ProfileInfo( props ) {

    const [nameChangeGroup, setNameChangeGroup] = useState(false);
    const [nameGroup, setNameGroup] = useState('')
    const oldNameGroup = useRef(nameGroup)
    const contacts = useRef(props.contacts)
    const contactNow = useRef(props.contact)
    const [onProfilePic, setHoverStatusProfilePic] = useState(false)
    const [descriptionPressed, setDescriptionPressed] = useState(false)
    const [description, setDescription] = useState('')

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

    useEffect(() => {
        if(props.contact.is_group === true) {
            // console.log("Changing group name after change in profile")
            settingGroupName(props.contact.group_name)
            setDescriptionAsync(props.contact.group_description)
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

    function getImage(contact: any) {
        // console.log("in get image contact = " + JSON.stringify(contact))
        if(contact.is_group === false) {
            const image = props.images.find((image: any) => {return image.sender_id === props.contact.contact_id});
            return image || { data: "" }; // Ensure we return a fallback value
        } else {
            const image = props.images.find((image: any) => {return image.id === props.contact.group_pic_id});
            // console.log("image = " +  JSON.stringify(image))
            return image || { data: "" }; // Ensure we return a fallback value
        }
    }

    function getNameContact(contact: any) {
        if(contact.is_group === true){
            // console.log("contact name = " + JSON.stringify(contact.group_name))
            return contact.group_name 
        } else {
            return props.users.find((user) => { return contact.contact_id === user.id}).username
        }
    }

    function getUser(contact: any) {
        // console.log("Is contact group or not: " + contact.is_group)
        if(contact.is_group === false){
            return props.users.find((id) => { return id.id === contact.contact_id})   
        }
    }

    async function changeGroupName(contact: any, newName: string) {
        if(contact.is_group === true){
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
        <div className="relative top-[5%] left-[10%] w-[50%] h-[90%] rounded-lg bg-[#7DD8C3] border-[3px] flex-col overflow-y-scroll scrollbar-hide">
            <div className="relative left-0 h-[60%] w-[full] flex-col bg-gray-600 bg-opacity-60">
                <div className="relative left-0 flex h-[15%] w-full flex-row items-center">
                    <div className="h-full flex w-[12%] flex-row justify-center items-center hover:rounded-xl hover:bg-gray-500" onClick={() => {props.setProfileInfo(false)}}>
                        <img src="./xicon.png" className="flex flex-col max-w-[60%] max-h-[60%] justify-center"></img>
                    </div>
                    <div className="h-full flex w-[30%] flex-col justify-center items-start text-black font-semibold">Contact info</div>
                </div>
                <div className="relative flex flex-col h-[60%] w-[6/10] items-center justify-center">
                    <div className="relative flex h-full max-w-[50%] items-center justify-center rounded-full"
                        onMouseEnter={() => {setHoverStatusProfilePic(true); console.log("On profile pic")}}
                        onMouseLeave={() => {setHoverStatusProfilePic(false); console.log("out of profile pic")}}
                    >
                        {/* Profile Picture */}
                        {(props.contact !== null && getImage(props.contact).data !== "") ? (
                            <img
                                src={`data:image/jpg;base64,${getImage(props.contact).data}`}
                                className={`cursor-pointer rounded-full max-w-[100%] max-h-[80%]`}
                            />
                        ) : (
                            <img
                                src="./userProfile2.png"
                                className={`cursor-pointer rounded-full max-w-[100%] max-h-[80%]`}
                            />
                        )}

                        {/* Input Overlaid on Top of the Image */}
                        {/* {(props.contact !== null && onProfilePic === true && props.contact.is_group === true) && ( */}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute top-0 left-0 w-full h-full z-20 cursor-pointer opacity-0"
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
                            />
                        {/* )} */}
                    </div>
                </div>

                <div className="relative flex flex-col h-[25%] items-center">
                    <div className="absolute flex flex-row w-[60%] h-[60%] items-center justify-center">
                        {props.contact !== null ? (nameChangeGroup === true ? 
                            (<input value={nameGroup} className="flex flex-row justify-center items-center text-lg text-black font-medium font-sans h-full w-full outline-none overflow-x-auto border-b-2 bg-transparent border-green-800" 
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
                            <div className="flex flex-row justify-center items-center text-lg text-black font-medium font-sans h-full w-full">{getNameContact(props.contact)}</div>) 
                            : <div className="flex flex-row justify-center items-center text-lg text-black font-medium font-sans h-full w-full"></div>}
                        <div className="flex flex-row justify-center items-center text-lg text-black font-medium font-sans h-full w-[20%] hover:cursor-pointer" onClick={() => {(settingOppositeNameChangeGroup())}}>
                            {(props.contact !== null && props.contact.is_group === true) 
                                ? <img src="./editIcon.png" className="flex text-lg text-black font-medium font-sans left-[10%] h-[40%]" onClick={() => {}}></img>
                                : <></>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <AboutProfile setDescriptionPressedAsync={setDescriptionPressedAsync} descriptionPressed={descriptionPressed} contact={props.contact}
                            description={description} setDescriptionAsync={setDescriptionAsync} changeGroupDescription={changeGroupDescription} users={props.users}>
            </AboutProfile>
            {props.contact.is_group === true && <Members users={props.users} images={props.images} contact={props.contact} contacts={props.contacts}></Members>}
            
        </div>
    );
}

function AboutProfile(props) {

    const prevAbout = useRef('')

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
        <div className="relative left-0 top-[3%] h-[15%] w-full flex flex-col justify-center bg-gray-600 bg-opacity-60">
                <div className="flex text-md text-black indent-[15px] h-[50%] w-full font-medium font-sans items-center">About</div>
                <div className="flex text-md text-white indent-[15px] h-[50%] w-full font-sans flex-row items-start">
                    <div className="w-[90%] h-full hover:cursor-pointer flex items-start" onClick={() => {props.setDescriptionPressedAsync(true)}}>
                        {
                            (props.contact !== null) ? 
                                (props.contact.is_group === true && props.descriptionPressed === false ? ((props.contact.group_description === '') ? 'Add group description' 
                                                                                                            : props.contact.group_description) 
                                                                 : (props.contact.is_group === false && props.descriptionPressed === true) ? props.getUser(props.contact).about : '') : ''}
                        {
                            (props.contact !== null) ? 
                                ((props.contact.is_group === true && props.descriptionPressed === true) ? 
                                    <input placeholder="Add description to group" 
                                           value={props.description}
                                           className="w-full outline-none bg-transparent border-b-2 border-green-700 text-white font-sans text-md"
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
                    <div className="w-[10%] h-full">
                        <img src="./editIcon.png" className="flex text-lg text-black font-medium font-sans left-[10%] h-[40%] hover:cursor-pointer overflow-x-scroll" onClick={() => {props.setDescriptionPressedAsync(true)}}></img>
                    </div>
                </div>
            </div>
    );
}

function Members(props) {

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
    }, [props.contact])

    return (
        <div className="relative left-0 top-[6%] w-full flex flex-col justify-center bg-gray-600 bg-opacity-60 overflow-scroll scrollbar-hide">
            {props.contact.members.map((id) => ( 
                <div className={`relative flex h-[100px] w-full flex-row hover:bg-slate-300 hover:bg-opacity-30`}>
                    <div className={`flex w-[15%] h-full flex-row justify-center items-center`}>
                        {(getProfilePic(getUser(id)).data !== "") ? 
                                <img src={`data:image/jpg;base64,${getProfilePic(getUser(id)).data}`} className="max-h-[60%] rounded-full"></img> :
                                <img src={`./userProfile2.png`} className="max-h-[60%] rounded-full"></img>
                        }
                    </div>
                    <div className="flex w-[75%] h-full flex-col justify-start">
                        <div className="flex h-[50%] text-black font-sans text-md font-medium items-end">{getUser(id).username}</div>
                        <div className="flex h-[50%] text-white font-sans text-md items-start">{getUser(id).about}</div>
                    </div>    
                </div>
            ))}
        </div>
    );

}