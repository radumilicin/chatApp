import react, { useState, useEffect, useRef } from 'react'
import { GrUserAdmin } from "react-icons/gr";
import { CiCircleRemove } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";

export default function ProfileInfo(props) {

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

    const settingGroupName = (val) => {
        setNameGroup(val)
    }

    const settingOppositeNameChangeGroup = async () => {
        setNameChangeGroup(!nameChangeGroup)
    }

    const setIsAdminAsync = async (val: boolean) => {
        setIsAdmin(val)
    }

    useEffect(() => {
        contactNow.current = props.contact
        if (props.contact.is_group === true) {
            // console.log("Changing group name after change in profile")
            settingGroupName(props.contact.group_name)
            setDescriptionAsync(props.contact.group_description)
            if (props.contact.admins.includes(props.curr_user)) setIsAdminAsync(true)
            else setIsAdminAsync(false)
        } else {
            setDescriptionAsync(getUser(props.contact).about)
        }
    }, [props.contact, props.contacts])

    useEffect(() => {
        console.log("Fetching contacts after entering in DB")
        var changed_contact = props.contacts.find((kontakt) => { return kontakt.id === contactNow.current.id })

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
        if (contact === null || contact === undefined) {
            return { data: "" }
        }
        if (!contact.is_group) {
            const image = props.images.find((image: any) => (image.user_id === contact.sender_id && contact.sender_id !== props.curr_user) ||
                (image.user_id === contact.contact_id && contact.contact_id !== props.curr_user));
            return image || { data: "" }; // Ensure we return a fallback value
        } else {
            const image = props.images.find((image: any) => image.id === contact.group_pic_id);
            return image || { data: "" }; // Ensure we return a fallback value
        }
    }

    function getNameContact(contact: any) {
        if (contact === null || contact === undefined) return ""
        if (contact.is_group === true) {
            // console.log("contact name = " + JSON.stringify(contact.group_name))
            return contact.group_name
        } else {
            // Get the OTHER user (not the current user)
            const otherUserId = contact.sender_id === props.curr_user ? contact.contact_id : contact.sender_id;
            return props.users.find((user) => { return otherUserId === user.id }).username
        }
    }

    function getUser(contact: any) {
        if (contact === null || contact === undefined) return { data: "" }
        // console.log("Is contact group or not: " + contact.is_group)
        if (contact.is_group === false) {
            // Get the OTHER user (not the current user)
            const otherUserId = contact.sender_id === props.curr_user ? contact.contact_id : contact.sender_id;
            return props.users.find((id) => { return id.id === otherUserId })
        }
    }

    async function changeGroupName(contact: any, newName: string) {
        if ((contact !== null && contact !== undefined) && contact.is_group === true) {
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
                props.setDecryptedContacts((currArr) =>
                    currArr.map(c => c.id === contact.id ? { ...c, group_name: newName } : c)
                )
                props.setCurrContact({ ...props.contact, group_name: newName })
            } catch (error) {
                console.error(error)
            }
        }
    }

    async function changeGroupDescription(desc: string) {
        let group_id = null
        if (props.contact.is_group === true) group_id = props.contact.id
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
        if (response.status === 200) {
            await props.fetchContacts()
            props.setDecryptedContacts((currArr) =>
                currArr.map(c => c.id === props.contact.id ? { ...c, group_description: desc } : c)
            )
            props.setCurrContact({ ...props.contact, group_description: desc })
        } else {
            console.log("Could not change group description")
        }
    }

    function currUserIsAdmin() {
        if (props.contact.admins.length === 0) return false

        return props.contact.admins.find(props.curr_user) !== null
    }

    async function changeProfilePic(base64Img) {
        let group_id = null
        if (props.contact.is_group === true) group_id = props.contact.id
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
        if (response.status === 200) {
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
        <div className={`flex-1 min-w-0 h-full border-[1px] [container-type:size]
            ${props.themeChosen === "Dark"
                ? "bg-gradient-to-b from-slate-900/95 via-gray-900/90 to-slate-900/95"
                : "bg-gradient-to-b from-gray-100 to-gray-200"}
            backdrop-blur-xl rounded-r-2xl flex-col shadow-2xl
            border ${props.themeChosen === "Dark" ? "border-cyan-500/20" : "border-gray-300"}
            overflow-y-scroll scrollbar-hidden`}>

            {/* Top gradient header section */}
            <div className={`relative left-0 h-[60%] w-full flex-col overflow-hidden
                ${props.themeChosen === "Dark"
                    ? "bg-gradient-to-b from-slate-900/80 via-slate-800/60 to-transparent"
                    : "bg-gradient-to-b from-gray-200/50 to-transparent"}`}>


                {/* Header with close button */}
                <div className={`relative left-0 flex h-[15%] w-full flex-row items-center z-10 border-b ${props.themeChosen === "Dark" ? "border-cyan-500/10" : "border-gray-300/50"}`}>
                    <div className="flex h-full w-[10%] items-center justify-center" onClick={() => props.setProfileInfo(false)}>
                        <div className={`flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14
                            rounded-full transition-all group cursor-pointer
                            ${props.themeChosen === "Dark"
                                ? "hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30"
                                : "hover:bg-gray-300/50"}
                            hover:scale-105 active:scale-95`}>
                            <img
                                src={`${props.themeChosen === "Dark" ? "./close-white.png" : "./close.png"}`}
                                alt="Close"
                                className="w-3 h-3 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>
                    <div className={`h-full flex w-[80%] flex-col justify-center items-start px-4
                        ${props.themeChosen === "Dark" ? "bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "text-black"}
                        font-bold text-xl xl:text-2xl font-sans tracking-wide
                        `}>
                        Contact info
                    </div>
                </div>

                {/* Profile Picture Section */}
                <div className="relative flex flex-col h-[60%] w-full items-center justify-center py-6">
                    <div className="relative flex h-full max-w-[50%] items-center justify-center group/profile"
                        onMouseEnter={() => { setHoverStatusProfilePic(true); console.log("On profile pic") }}
                        onMouseLeave={() => { setHoverStatusProfilePic(false); console.log("out of profile pic") }}
                    >

                        {/* Profile Picture */}
                        {((props.contact !== undefined && props.contact !== null) && !props.contact.is_group && getImage(props.contact).data && getUser(props.contact).profile_pic_visibility !== 'Nobody') ? (
                            <img
                                src={getImage(props.contact).data.startsWith('data:image')
                                    ? `${getImage(props.contact).data}`
                                    : `data:image/jpeg;base64,${getImage(props.contact).data}`}
                                className={`relative cursor-pointer rounded-full w-[200px] h-[200px]
                                    border-4 ${props.themeChosen === "Dark" ? "border-cyan-400/50" : "border-gray-300"}
                                    shadow-2xl ${props.themeChosen === "Dark" ? "shadow-cyan-500/20 group-hover/profile:border-cyan-300 group-hover/profile:shadow-cyan-400/40" : ""}
                                    group-hover/profile:scale-105 transition-all duration-300 z-10`}
                            />
                        ) : ((props.contact !== undefined && props.contact !== null) && props.contact.is_group && getImage(props.contact).data) ? (
                            <img
                                src={`data:image/jpeg;base64,${getImage(props.contact).data}`}
                                className={`relative cursor-pointer rounded-full w-[200px] h-[200px]
                                    border-4 ${props.themeChosen === "Dark" ? "border-cyan-400/50" : "border-gray-300"}
                                    shadow-2xl ${props.themeChosen === "Dark" ? "shadow-cyan-500/20 group-hover/profile:border-cyan-300 group-hover/profile:shadow-cyan-400/40" : ""}
                                    ${onProfilePic && props.contact.admins.includes(props.curr_user) ? 'blur-sm' : ''}
                                    group-hover/profile:scale-105 transition-all duration-300 z-10`}
                            />
                        ) : ((props.contact !== undefined && props.contact !== null) && props.contact.is_group) ? (
                            <img
                                src={`${props.themeChosen === "Dark" ? "./group-white.png" : "./group.png"}`}
                                className={`relative cursor-pointer rounded-full w-[180px] h-[180px] lg:w-[200px] lg:h-[200px]
                                    border-4 ${props.themeChosen === "Dark" ? "border-cyan-400/50" : "border-gray-300"}
                                    shadow-2xl ${props.themeChosen === "Dark" ? "shadow-cyan-500/20 group-hover/profile:border-cyan-300 group-hover/profile:shadow-cyan-400/40" : ""}
                                    ${onProfilePic && props.contact.admins.includes(props.curr_user) ? 'blur-sm' : ''}
                                    group-hover/profile:scale-105 transition-all duration-300 z-10`}
                            />
                        ) : (
                            <img
                                src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "./userProfile2.png"}`}
                                className={`relative cursor-pointer rounded-full w-[180px] h-[180px] lg:w-[200px] lg:h-[200px]
                                    border-4 ${props.themeChosen === "Dark" ? "border-cyan-400/50" : "border-gray-300"}
                                    shadow-2xl ${props.themeChosen === "Dark" ? "shadow-cyan-500/20 group-hover/profile:border-cyan-300 group-hover/profile:shadow-cyan-400/40" : ""}
                                    group-hover/profile:scale-105 transition-all duration-300 z-10`}
                            />
                        )}

                        {/* Camera overlay on hover for group admins */}
                        {onProfilePic && props.contact.is_group && props.contact.admins.includes(props.curr_user) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-2">
                                <img src={`${props.themeChosen === "Dark" ? "./camera-white.png" : "./camera.png"}`} className="h-16 w-16" alt="Camera" />
                                <p className={`font-medium text-sm xl:text-base text-center px-4 ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"}`}>
                                    Change group picture
                                </p>
                            </div>
                        )}

                        {/* Input Overlaid on Top of the Image */}
                        {props.contact.is_group === true && props.contact.admins.includes(props.curr_user) && <input
                            type="file"
                            accept="image/*"
                            className="absolute top-0 left-0 w-full h-full z-40 cursor-pointer opacity-0"
                            onClick={() => { console.log("File input clicked") }}
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

                {/* Contact Name Section */}
                <div className="relative flex flex-col h-[25%] items-center justify-center">
                    <div ref={divRef} className="relative flex flex-row w-[70%] h-[60%] items-center justify-center group/name">
                        {(props.contact !== undefined || props.contact !== null) ? (nameChangeGroup === true ?
                            (<input
                                value={nameGroup}
                                className={`flex flex-row justify-center items-center text-lg lg:text-xl xl:text-2xl
                                    ${props.themeChosen === "Dark" ? `text-cyan-200 border-cyan-500
                                    focus:border-cyan-400 transition-all placeholder:text-cyan-300/50` : "text-gray-800 border-gray-400"}
                                    font-bold font-sans h-full w-[75%] outline-none overflow-x-auto
                                    border-b-2 bg-transparent`}
                                onChange={(e) => {
                                    setNameGroup(e.target.value)
                                    console.log("input = " + nameGroup)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (oldNameGroup.current !== nameGroup) {
                                            changeGroupName(props.contact, nameGroup)
                                            setNameChangeGroup(false)
                                            oldNameGroup.current = nameGroup
                                        }
                                    }
                                }}
                                placeholder={getNameContact(props.contact)}>
                            </input>)
                            :
                            <div className={`flex flex-row justify-center items-center text-xl lg:text-2xl
                                font-bold font-sans h-full w-[75%] tracking-wide truncate ${props.themeChosen === "Dark" ? "bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                                    : "text-black"}
                                `}>
                                {getNameContact(props.contact)}
                            </div>)
                            : <div className="flex flex-row justify-center items-center text-lg text-black font-medium font-sans h-full w-full"></div>}

                        {/* Edit button */}
                        <div className="absolute flex flex-row justify-center items-center h-full right-0 w-[15%]" onClick={() => {
                            if (nameChangeGroup && oldNameGroup.current !== nameGroup) {
                                changeGroupName(props.contact, nameGroup)
                                oldNameGroup.current = nameGroup
                            }
                            settingOppositeNameChangeGroup()
                        }}>
                            {((props.contact !== undefined && props.contact !== null) && props.contact.is_group === true && props.contact.admins.includes(props.curr_user))
                                ? <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full
                                    transition-all cursor-pointer group/edit
                                    ${props.themeChosen === "Dark"
                                        ? "hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20"
                                        : "hover:bg-gray-300/50"}
                                    hover:scale-105 active:scale-95`}>
                                    <img
                                        src={`${props.themeChosen === "Dark" ? "./edit_white.png" : "./editIcon.png"}`}
                                        className="w-4 h-4 lg:w-5 lg:h-5 opacity-70 group-hover/edit:opacity-100 transition-opacity"
                                        onClick={() => { }}
                                    />
                                </div>
                                : <></>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <AboutProfile setDescriptionPressedAsync={setDescriptionPressedAsync} descriptionPressed={descriptionPressed} contact={props.contact}
                description={description} setDescriptionAsync={setDescriptionAsync} changeGroupDescription={changeGroupDescription} users={props.users} getUser={getUser} themeChosen={props.themeChosen} curr_user={props.curr_user}>
            </AboutProfile>
            {props.contact.is_group === true && <Members users={props.users} images={props.images} contact={props.contact} contacts={props.contacts} setAddToGroup={props.setAddToGroup} getUser={getUser}
                fetchContacts={props.fetchContacts} themeChosen={props.themeChosen} curr_user={props.curr_user} setCurrContact={props.setCurrContact} setDecryptedContacts={props.setDecryptedContacts}></Members>}
            {props.contact.is_group === true && <OptionsGroup curr_user={props.curr_user} contact={props.contact} users={props.users} contacts={props.contacts} fetchContacts={props.fetchContacts} getUser={getUser} setCurrContact={props.setCurrContact}
                decryptedContacts={props.decryptedContacts} setDecryptedContacts={props.setDecryptedContacts} setProfileInfo={props.setProfileInfo} themeChosen={props.themeChosen}></OptionsGroup>}
            {props.contact.is_group === false && <OptionsChat curr_user={props.curr_user} contact={props.contact} users={props.users} contacts={props.contacts} fetchContacts={props.fetchContacts} getUser={getUser} setCurrContact={props.setCurrContact} setProfileInfo={props.setProfileInfo} themeChosen={props.themeChosen}
                setDecryptedContacts={props.setDecryptedContacts}></OptionsChat>}
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
        if (props.contact !== null) {
            if (props.contact.is_group === true) {
                prevAbout.current = props.contact.group_description
            } else {
                prevAbout.current = props.users.find((user) => { return user.id === props.contact.contact_id }).about
            }
        }
    }, [props.contact])



    return (
        <div className={`relative left-0 top-[0%] h-[15%] w-full flex flex-col justify-center
            ${props.themeChosen === "Dark"
                ? "bg-slate-800/20 border-cyan-500/20"
                : "bg-gray-100/30 border-gray-300"}
            border-y-[1px]`}>

            {/* About Title */}
            <div className={`flex text-xl lg:text-2xl px-8 h-[60%] w-full font-bold font-sans items-center 
                ${props.themeChosen === "Dark"
                    ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent"
                    : "text-gray-800"}`}>
                About
            </div>

            {/* About Content */}
            <div ref={divRef} className="flex flex-row px-8 h-[40%] w-full font-sans items-center justify-center">
                <div className={`flex flex-row w-[90%] h-full items-start justify-start text-lg xl:text-xl truncate
                    ${props.themeChosen === "Dark" ? "text-cyan-100/80" : "text-gray-700"}
                    ${props.contact.is_group && props.contact.admins.includes(props.curr_user) ? "hover:cursor-pointer" : ""}
                    ${props.descriptionPressed ? 'ml-2' : ''}
                    transition-colors`}
                    onClick={() => { props.contact.is_group && props.contact.admins.includes(props.curr_user) ? props.setDescriptionPressedAsync(true) : {} }}>
                    {
                        (props.contact !== null) ?
                            (props.contact.is_group === true ?
                                (props.descriptionPressed === false ?
                                    ((props.contact.group_description === '') ?
                                        <span className="text-cyan-400/60 italic">Add group description</span>
                                        : props.contact.group_description)
                                    : null)
                                : (props.getUser(props.contact).status_visibility !== "Nobody") ?
                                    props.getUser(props.contact).about : `Hey there I'm using Walkie Talkie`) : ''}
                    {
                        (props.contact !== null) ?
                            ((props.contact.is_group === true && props.descriptionPressed === true) ?
                            <input placeholder="Add description to group"
                                    value={props.description}
                                    className={`w-[98%] outline-none bg-transparent border-b-2 border-cyan-500
                                           ${props.themeChosen === "Dark" ? "text-cyan-200 focus:border-cyan-400 transition-all placeholder:text-cyan-400/50" 
                                                                        : "text-gray-800 border-gray-400"} font-sans text-lg xl:text-xl
                                           `}
                                    onChange={(e) => {
                                        props.setDescriptionAsync(e.target.value)
                                        console.log("Description: " + props.description)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === 'Escape') {
                                            console.log("input has been submitted")
                                            props.changeGroupDescription(props.description)
                                            props.setDescriptionPressedAsync(false)
                                            prevAbout.current = props.description
                                        }
                                    }}
                                >
                                </input> : <></>) : <></>
                    }
                </div>

                {/* Edit button */}
                <div className="w-[10%] h-full flex items-start justify-center">
                    {props.contact.is_group === true && props.contact.admins.includes(props.curr_user) &&
                        <div className={`flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 rounded-full
                            transition-all cursor-pointer group/edit
                            ${props.themeChosen === "Dark"
                                ? "hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20"
                                : "hover:bg-gray-300/50"}
                            hover:scale-105 active:scale-95`}
                            onClick={() => {
                                if (props.descriptionPressed) props.setDescriptionPressedAsync(false)
                                else props.setDescriptionPressedAsync(true)
                            }}>
                            <img
                                src={`${props.themeChosen === "Dark" ? "./edit_white.png" : "./editIcon.png"}`}
                                className="w-4 h-4 lg:w-5 lg:h-5 opacity-70 group-hover/edit:opacity-100 transition-opacity"
                            />

                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

function Members(props) {

    const [pressed, setPressed] = useState([])
    const [userToAddAsAdmin, setUserToAddAsAdmin] = useState(-1)
    const menuRef = useRef<HTMLDivElement>(null)

    const updatePressedAsync = async (arr: any) => {
        setPressed(arr)
    }

    const closeAllMenus = () => {
        setPressed(prev => prev.map(() => false))
    }

    const updatePressedIndex = async (idx: number) => {
        const filteredPressed = pressed.map((elem, i) =>
            i === idx ? ((elem === true) ? false : true) : false
        );
        console.log("filteredPressed after press" + JSON.stringify(filteredPressed));
        updatePressedAsync(filteredPressed);
    }

    function getUser(user_id) {
        const user = props.users.find((user) => { return user.id === user_id })
        return user || { data: "" }
    }

    function getProfilePic(user: any) {
        console.log("HERE?")
        const image = props.images.find((image: any) => image.id === user.profile_pic_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    // Click outside handler to close menus
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeAllMenus()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        console.log("members = " + props.contact.members)
        if (props.contact !== null && props.contact.is_group === true) updatePressedAsync(props.contact.members.map(() => false))
    }, [props.contact])

    async function kickFromGroup(val: number) {
        console.log("curr_user = " + props.curr_user + " group_id = " + props.contact.id)
        if (props.contact !== null && props.contact.is_group === true) {
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
            if (response.status === 200) {
                console.log(JSON.stringify(props.getUser(val)) + " has been kicked out from the group " + props.contact.group_name)
                await props.fetchContacts()
                props.setDecryptedContacts((currArr) =>
                    currArr.map(c => {
                        if (c.id === props.contact.id) {
                            return {
                                ...c,
                                members: c.members.filter(m => m !== val),
                                admins: c.admins.filter(a => a !== val)
                            }
                        }
                        return c
                    })
                )
            } else {
                console.log("Error exiting the group " + JSON.stringify(props.contact.group_name))
            }
        }
    }

    async function makeAdmin(val: number) {
        if (props.contact !== null && props.contact.is_group === true) {
            let body = {
                userToAddAsAdmin: val,
                group_id: props.contact.id,
                admins: props.contact.admins
            }

            let requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }

            const response = await fetch(`http://localhost:3002/makeAdmin`, requestOptions);
            if (response.ok) {
                console.log("User " + val + " successfully made admin")
                await props.fetchContacts()
                props.setDecryptedContacts((currArr) =>
                    currArr.map(c => {
                        if (c.id === props.contact.id) {
                            return {
                                ...c,
                                admins: [...c.admins, val]
                            }
                        }
                        return c
                    })
                )
            } else {
                console.log("response error: " + response.status)
            }
        }
    }

    return (
        <div ref={menuRef} className={`relative left-0 top-0 w-full flex flex-col justify-center
            ${props.themeChosen === "Dark"
                ? "bg-slate-800/20 border-cyan-500/20"
                : "bg-gray-100/30 border-gray-300"}
            overflow-scroll scrollbar-hide border-b-[1px]`}>

            {/* Add Member Button */}
            {props.contact.admins.includes(props.curr_user) && <div className={`relative flex min-h-[max(100px,12.5cqh)] w-full flex-row items-center px-4 group
                transition-all duration-300 cursor-pointer
                ${props.themeChosen === "Dark"
                    ? "hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/20"
                    : "hover:bg-gray-300/50"}
                hover:scale-[1.01] active:scale-[0.99] border-b border-cyan-500/10`}
                onClick={() => { props.setAddToGroup(true); console.log("Should show list of people to add to group") }}>

                <div className="flex w-[80px] shrink-0 h-full items-center justify-center">
                    <div className="relative">
                        {props.themeChosen === "Dark" && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/30 to-cyan-400/30 blur-md group-hover:blur-lg transition-all" />}
                        <img src="./addFrendo.png" className="relative w-12 h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 rounded-full border-2 border-green-400/50 shadow-lg group-hover:scale-105 transition-all" />
                    </div>
                </div>

                <div className="flex flex-1 h-full items-center pl-[10px]">
                    <div className={`text-base xl:text-lg font-sans font-bold
                        ${props.themeChosen === "Dark" ? `bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent
                        group-hover:from-green-300 group-hover:to-cyan-300 transition-all` : `text-green-500`} `}>
                        Add member
                    </div>
                </div>
            </div>}

            {/* Members List */}
            {[...props.contact.members].sort((a, b) => {
                // Current user always first
                if (a === props.curr_user) return -1;
                if (b === props.curr_user) return 1;
                // Admins before regular users
                const aIsAdmin = props.contact.admins.includes(a);
                const bIsAdmin = props.contact.admins.includes(b);
                if (aIsAdmin && !bIsAdmin) return -1;
                if (!aIsAdmin && bIsAdmin) return 1;
                return 0;
            }).map((id, idx) => (
                <div key={idx} className={`relative flex min-h-[max(100px,12.5cqh)] w-full flex-row items-center px-4 group
                transition-all duration-300 cursor-pointer select-none
                ${props.themeChosen === "Dark"
                        ? "hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/10"
                        : "hover:bg-gray-300/50"}
                ${!pressed[idx] ? "hover:scale-[1.01] active:scale-[0.99]" : ""} border-b border-cyan-500/5`}
                    onClick={() => { updatePressedIndex(idx) }}>

                    <div className="flex w-[80px] shrink-0 h-full items-center justify-center">
                        <div className="relative group/avatar">
                            {props.themeChosen === "Dark" && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-md group-hover/avatar:blur-lg transition-all scale-110" />}
                            {(getProfilePic(getUser(id)).data !== "") ?
                                <img
                                    src={`data:image/jpg;base64,${getProfilePic(getUser(id)).data}`}
                                    className={`relative w-12 h-12 xl:w-14 xl:h-14 rounded-full border-2 ${props.themeChosen === "Dark" ? "border-cyan-400/50" : ""} shadow-lg transition-all group-hover/avatar:scale-105`}
                                /> :
                                <img
                                    src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "./userProfile2.png"}`}
                                    className={`relative w-12 h-12 xl:w-14 xl:h-14 rounded-full border-2 ${props.themeChosen === "Dark" ? "border-cyan-400/50" : ""}  shadow-lg transition-all group-hover/avatar:scale-105`}
                                />
                            }
                        </div>
                    </div>

                    <div className="flex flex-1 min-w-0 h-full flex-col justify-center py-4 pl-[10px]">
                        <div className={`flex flex-row text-base xl:text-lg font-sans font-semibold items-center
                        ${props.themeChosen === "Dark" ? "text-cyan-200" : "text-gray-900"}`}>
                            {getUser(id).username}
                            {props.curr_user === id && <span className={`text-sm xl:text-base ${props.themeChosen === "Dark" ? "text-gray-600" : ""}`}>&nbsp;&nbsp;(You)</span>}
                            {(props.contact.admins.includes(id)) && <span className={`${props.themeChosen === "Dark" ? `bg-gradient-to-r from-green-500/90 to-cyan-500/90 rounded-full text-white` 
                                                                 : `bg-gray-400 hover:bg-gray-500 text-black`} rounded-full text-sm px-2 ml-2 lg:hidden`}>Admin</span>}
                        </div>
                        <div className={`flex text-sm xl:text-base font-sans
                        ${props.themeChosen === "Dark" ? "text-cyan-300/60" : "text-gray-600"}
                        truncate`}>
                            {getUser(id).about}
                        </div>
                    </div>

                    {/* Admin Badge */}
                    {(props.contact.admins.includes(id)) &&
                        <div className={`absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center
                        px-3 py-1 ${props.themeChosen === "Dark" ? `bg-gradient-to-r from-green-500/90 to-cyan-500/90 rounded-full text-white` 
                                                                 : `bg-gray-400 hover:bg-gray-500 text-black`}  rounded-full text-sm font-bold shadow-lg`}>
                            Admin
                        </div>
                    }

                    {/* Action Menu */}
                    {pressed[idx] == true && props.curr_user !== id &&
                        <div className={`absolute flex flex-col left-[65%] xl:left-[70%] top-[85%] w-[32%] lg:w-[28%]
                    rounded-xl overflow-hidden z-50 shadow-2xl
                    ${props.themeChosen === "Dark"
                                ? "bg-slate-800/95 border border-cyan-500/30 backdrop-blur-xl"
                                : "bg-white border border-gray-300"}`}
                            onClick={(e) => e.stopPropagation()}>

                            
                                <div className={`flex flex-row w-full h-12 items-center px-4 gap-3 group/menu
                            transition-all cursor-pointer select-none
                            ${props.themeChosen === "Dark"
                                        ? "hover:bg-blue-500/40 text-blue-300"
                                        : "hover:bg-blue-500/40 text-black"}`}
                                    onClick={() => {
                                        const contact = props.contacts.find(c =>
                                            !c.is_group &&
                                            ((c.sender_id === props.curr_user && c.contact_id === id) ||
                                                (c.contact_id === props.curr_user && c.sender_id === id))
                                        );
                                        if (contact) props.setCurrContact(contact);
                                    }}>
                                    <CgProfile className="w-5 h-5 flex-shrink-0 opacity-80 group-hover/menu:opacity-100 transition-opacity" />
                                    <span className="text-sm lg:text-base font-medium">View profile</span>
                                </div>

                            {props.contact.admins.includes(props.curr_user) && !props.contact.admins.includes(id) &&
                                <div className={`flex flex-row w-full h-12 items-center px-4 gap-3 group/menu
                            transition-all cursor-pointer select-none
                            ${props.themeChosen === "Dark"
                                        ? "hover:bg-cyan-500/20 text-cyan-200"
                                        : "hover:bg-gray-100 text-gray-800"}
                            border-b ${props.themeChosen === "Dark" ? "border-cyan-500/20" : "border-gray-200"}`}
                                    onClick={() => { makeAdmin(id) }}>
                                    <GrUserAdmin className="w-5 h-5 flex-shrink-0 opacity-80 group-hover/menu:opacity-100 transition-opacity" />
                                    <span className="text-sm lg:text-base font-medium">Make admin</span>
                                </div>
                            }

                            {props.contact.admins.includes(props.curr_user) && !props.contact.admins.includes(id) &&
                                <div className={`flex flex-row w-full h-12 items-center px-4 gap-3 group/menu
                            transition-all cursor-pointer select-none
                            ${props.themeChosen === "Dark"
                                        ? "hover:bg-red-500/20 text-red-400"
                                        : "hover:bg-red-50 text-red-600"}`}
                                    onClick={() => { kickFromGroup(id) }}>
                                    <CiCircleRemove className="w-5 h-5 flex-shrink-0 opacity-80 group-hover/menu:opacity-100 transition-opacity" />
                                    <span className="text-sm lg:text-base font-medium">Remove user</span>
                                </div>
                            }
                        </div>
                    }
                </div>
            ))}
        </div>
    );
}

function OptionsGroup(props) {

    useEffect(() => {

    }, [props.decryptedContacts])

    async function exitGroup() {
        console.log("curr_user = " + props.curr_user + " group_id = " + props.contact.id)
        if (props.contact !== null && props.contact.is_group === true) {
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
            if (response.status === 200) {
                console.log(JSON.stringify(props.getUser(props.curr_user)) + " has exited the group " + props.contact.group_name)

                await props.fetchContacts()

                localStorage.removeItem(`conversation_${props.contact.id}`)
                localStorage.removeItem(`conversation_${props.curr_user}_${props.contact.id}`)

                // Filter out the deleted chat from decryptedContacts
                props.setDecryptedContacts((currArr) =>
                    currArr.filter(c => c.id !== props.contact.id)
                )
            } else {
                console.log("Error exiting the group " + JSON.stringify(props.contact.group_name))
            }
        }
    }

    return (
        <div className={`relative left-0 top-0 w-full flex flex-col justify-center
            ${props.themeChosen === "Dark"
                ? "bg-slate-800/20"
                : "bg-gray-100/30"}
            overflow-scroll scrollbar-hide`}>

            <div className={`flex min-h-[max(100px,12.5cqh)] w-full flex-row items-center px-6 group
                transition-all duration-300 cursor-pointer
                ${props.themeChosen === "Dark"
                    ? "hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/20"
                    : "hover:bg-red-200"}
                hover:scale-[1.01] active:scale-[0.99]`}
                onClick={async () => { await exitGroup(); props.setCurrContact(null); props.setProfileInfo(false) }}>

                <div className="flex w-[80px] shrink-0 h-full items-center justify-center">
                    <div className="relative">
                        {props.themeChosen === "Dark" && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 blur-md group-hover:blur-lg transition-all" />}
                        <img src="./exitIcon.png" className="relative w-12 h-12 xl:w-14 xl:h-14 opacity-90 group-hover:scale-110 transition-all" />
                    </div>
                </div>

                <div className="flex flex-row flex-1 h-full items-center pl-[10px]">
                    <div className={`text-base xl:text-lg font-sans font-bold
                        bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent
                        group-hover:from-red-400 group-hover:to-orange-400 transition-all`}>
                        Exit group
                    </div>
                </div>
            </div>
        </div>
    );
}

function OptionsChat(props) {

    const cnt = useRef(0)

    async function deleteChat() {
        console.log("curr_user = " + props.contact.sender_id + " contact_id = " + props.contact.contact_id)

        const other_user = props.curr_user === props.contact.sender_id ? props.contact.contact_id : props.contact.sender_id

        if (props.contact !== null && props.contact.is_group === false) {
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
            if (response.status === 200) {
                console.log(JSON.stringify(props.getUser(props.curr_user)) + " has deleted the chat with " + other_user + " with id = " + JSON.stringify(props.contact.id))

                localStorage.removeItem(`conversation_${other_user}`)
                localStorage.removeItem(`conversation_${props.curr_user}_${other_user}`)

                await props.fetchContacts()
                // Filter out the deleted chat from decryptedContacts
                props.setDecryptedContacts((currArr) =>
                    currArr.filter(c => c.id !== props.contact.id)
                )
            } else {
                console.log("Error deleting chat " + JSON.stringify(props.contact.id))
            }
        }
    }

    function setCurrContactAfterChange() {
        props.setCurrContact(
            props.contacts.find((elem) => elem.id === props.contact.id)
        )
    }

    async function blockContact(status: string) {
        console.log("in block contact curr_user = " + props.curr_user + " contact_id = " + props.contact.contact_id)
        if ((props.contact !== null && props.contact !== undefined) && (props.curr_user !== null && props.curr_user !== undefined) && props.contact.is_group === false) {

            let action_by = props.contact.sender_id === props.curr_user ? "sender" : "receiver"
            let msg = {
                "id_contact": props.contact.id,
                "action_by": action_by,
                "status": status
            }

            let requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            }

            console.log(`Trying to block contact attempt ${cnt.current} with curr_user: ` + JSON.stringify(props.contact.sender_id) + " contact_id: " + JSON.stringify(props.contact.contact_id) + " status: " + status)

            const response = await fetch('http://localhost:3002/blockContact', requestOptions)
            if (response.status === 200) {
                console.log(JSON.stringify(props.getUser(props.contact.sender_id)) + " has blocked the chat with " + props.contact.contact_id + " with id = " + JSON.stringify(props.contact.id))
                await props.fetchContacts()
                props.setDecryptedContacts((currArr) =>
                    currArr.map(elem => {
                        if ((elem.sender_id === props.contact.sender_id && elem.contact_id === props.contact.contact_id) ||
                            (elem.sender_id === props.contact.contact_id && elem.contact_id === props.contact.sender_id)) {
                            return {
                                ...elem,
                                blocked_by_sender: action_by === "sender" ? (status === "block") : elem.blocked_by_sender,
                                blocked_by_receiver: action_by === "receiver" ? (status === "block") : elem.blocked_by_receiver
                            }
                        }
                        return elem
                    })
                )
                setCurrContactAfterChange()
            } else {
                console.log("Error blocking chat " + JSON.stringify(props.contact.id))
            }
        }
        cnt.current += 1
    }

    useEffect(() => {
        setCurrContactAfterChange()
    }, [props.contacts])

    return (
        <div className={`relative left-0 top-0 w-full flex flex-col
            ${props.themeChosen === "Dark"
                ? "bg-slate-800/20"
                : "bg-gray-100/30"}
            overflow-scroll scrollbar-hide`}>

            {/* Block/Unblock User */}
            {((props.contact.sender_id === props.curr_user && props.contact.blocked_by_sender === false) ||
                (props.contact.contact_id === props.curr_user && props.contact.blocked_by_receiver === false))
                && (
                    <div className={`flex flex-row items-center w-full min-h-[12.5cqh] px-6 group
                    transition-all duration-300 cursor-pointer
                    ${props.themeChosen === "Dark"
                            ? "hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/20 border-b border-cyan-500/10"
                            : "hover:bg-red-200 border-b border-gray-200"}
                    hover:scale-[1.01] active:scale-[0.99]`}
                        onClick={() => { blockContact('block'); }}>

                        <div className="flex w-[80px] shrink-0 h-full items-center justify-center">
                            <div className="relative">
                                {props.themeChosen === "Dark" && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-md group-hover:blur-lg transition-all" />}
                                <img src="./denied2.png" className="relative w-10 h-10 opacity-90 group-hover:scale-110 transition-all group-hover:rotate-90" />
                            </div>
                        </div>

                        <div className="flex flex-1 h-full items-center pl-[10px]">
                            <div className={`text-sm lg:text-base xl:text-lg font-sans font-bold
                            ${props.themeChosen === "Dark" ? "text-red-500" : "text-red-600"}
                            group-hover:text-red-500 transition-colors`}>
                                Block user
                            </div>
                        </div>
                    </div>
                )}
            {((props.contact.sender_id === props.curr_user && props.contact.blocked_by_sender === true) ||
                (props.contact.contact_id === props.curr_user && props.contact.blocked_by_receiver === true))
                && (
                    <div className={`flex flex-row items-center w-full min-h-[12.5cqh] px-6 group
                    transition-all duration-300 cursor-pointer
                    ${props.themeChosen === "Dark"
                            ? "hover:bg-green-500/10 hover:shadow-lg hover:shadow-green-500/20 border-b border-cyan-500/10"
                            : "hover:bg-green-50 border-b border-gray-200"}
                    hover:scale-[1.01] active:scale-[0.99]`}
                        onClick={() => { blockContact('unblock'); }}>

                        <div className="flex w-[80px] shrink-0 h-full items-center justify-center">
                            <div className="relative">
                                {props.themeChosen === "Dark" && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/20 to-cyan-500/20 blur-md group-hover:blur-lg transition-all" />}
                                <img src="./unblock2.png" className="relative w-10 h-10 opacity-90 group-hover:scale-110 group-hover:brightness-125 group-hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.9)] group-hover:drop-shadow-[0_0_24px_rgba(34,211,238,0.7)]" />
                            </div>
                        </div>

                        <div className="flex flex-1 h-full items-center pl-[10px]">
                            <div className={`text-sm lg:text-base xl:text-lg font-sans font-bold
                            bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent
                            group-hover:from-green-400 group-hover:to-cyan-400 transition-all`}>
                                Unblock user
                            </div>
                        </div>
                    </div>
                )}

            {/* Delete Chat */}
            <div className={`flex flex-row items-center w-full min-h-[12.5cqh] px-6 group
                transition-all duration-300 cursor-pointer
                ${props.themeChosen === "Dark"
                    ? "hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/30"
                    : "hover:bg-red-200"}
                hover:scale-[1.01] active:scale-[0.99]`}
                onClick={async () => { await deleteChat(); props.setCurrContact(null); props.setProfileInfo(false) }}>

                <div className="flex w-[80px] shrink-0 h-full items-center justify-center">
                    <div className="relative">
                        {props.themeChosen === "Dark" && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600/30 to-red-500/30 blur-md group-hover:blur-lg transition-all" />}
                        <img src="./trash-icon-red.png" className="relative w-10 h-10 opacity-90 transition-all 
                                                                   group-hover:translate-x-[-10px] group-hover:translate-y-[-10px] group-hover:-rotate-45
                                                                    group-hover:brightness-125 group-hover:drop-shadow-[0_0_14px_rgba(239,68,68,0.9)] group-hover:drop-shadow-[0_0_28px_rgba(220,38,38,0.6)]" />
                    </div>
                </div>

                <div className="flex flex-1 h-full items-center pl-[10px]">
                    <div className={`text-sm lg:text-base xl:text-lg font-sans font-bold
                        ${props.themeChosen === "Dark" ? "text-red-500" : "text-red-600"}
                        group-hover:text-red-500 transition-colors`}>
                        Delete chat
                    </div>
                </div>
            </div>
        </div>
    )
}