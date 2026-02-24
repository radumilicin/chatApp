import react, {useEffect, useState, useRef} from 'react'
import { API_URL } from '../config';

export default function AddPersonToGroupVertical(props) {

    const [searchedContact, setSearchedContact] = useState('')
    const [filteredContacts, setFilteredContacts] = useState([])
    const [pressedContacts, setPressedContacts] = useState([])

    const setPressedContactsAsync = async (arr : any) => {
        setPressedContacts(arr)
    }

    const setFilteredContactsAsync = async (arr : any) => {
        setFilteredContacts(arr)
    }

    const removePressedContactsAsync = async (elem) => {
        const updatedContacts = pressedContacts.filter(contact => contact.id !== elem.id);
        setPressedContactsAsync(updatedContacts);
    }

    useEffect(() => {
        if(props.users !== undefined || props.users !== null) setFilteredContactsAsync(props.users)
        changeFilteredContacts()
    }, [props.contacts, props.users])

    async function changeFilteredContacts () {
        if(props.contacts !== null || props.contacts !== undefined) {
            const users_matching_search = props.users.filter((user) => {return user.username.includes(searchedContact)})
            var filteredContactz = []
            for(let user of users_matching_search) {
                for(let contact of props.contacts){
                    if(contact.contact_id === user.id && contact.is_group === false && !props.contact.members.includes(user.id)) {
                        filteredContactz.push(user)
                    }
                }
            }
            setFilteredContactsAsync(filteredContactz)
        }
    }

    async function changeFilteredContacts2 (val: string) {
        if(props.contacts !== null || props.contacts !== undefined) {
            const users_matching_search = props.users.filter((user) => {return user.username.includes(val)})
            var filteredContactz = []
            for(let user of users_matching_search) {
                for(let contact of props.contacts){
                    if(contact.contact_id === user.id && contact.is_group === false && !props.contact.members.includes(user.id)) {
                        filteredContactz.push(user)
                    }
                }
            }
            setFilteredContactsAsync(filteredContactz)
        }
    }

    async function insertMembersInGroup() {

        if(props.contacts === null) return

        const msg = {
            members: pressedContacts,
            group_id: props.contact.id
        }

        const req_options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
        }

        const response = await fetch(`${API_URL}/insertMembersInGroup`, req_options)
        if(response.status === 200){
            await props.fetchContacts()
            console.log("Inserted users in group " + props.contact.id)
        } else {
            console.error("Could not insert in group")
        }
    }

    function getProfilePic(user: any) {
        console.log("HERE?")
        const image = props.images.find((image: any) => image.id === user.profile_pic_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    return (
        <div className={`absolute left-[5%] w-[90%] top-[5%] h-[85%] rounded-2xl overflow-hidden
            ${props.themeChosen === "Dark"
                ? "bg-gradient-to-b from-slate-900/95 via-gray-900/90 to-slate-900/95 border border-cyan-500/20"
                : "bg-gradient-to-b from-gray-100 to-gray-200 border border-gray-300"}
            backdrop-blur-xl shadow-2xl
            ${props.themeChosen === "Dark" ? "shadow-cyan-500/10" : "shadow-gray-400/30"}`}>

            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-50 pointer-events-none" />

            <div className="relative top-0 left-0 w-full h-full flex flex-col">
                {/* Header */}
                <div className={`relative flex flex-row h-[10%] w-full items-center
                    ${props.themeChosen === "Dark"
                        ? "bg-transparent"
                        : "bg-gray-200/80 border-b border-gray-300"}`}>

                    {/* Close button */}
                    <div className="flex w-[12%] h-full justify-center items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full
                            transition-all cursor-pointer group
                            ${props.themeChosen === "Dark"
                                ? "hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30"
                                : "hover:bg-gray-300/50"}
                            hover:scale-105 active:scale-95`}
                            onClick={() => { props.setAddToGroup(false); }}>
                            <img
                                src={`${props.themeChosen === "Dark" ? "./xicon-white.png" : "./xicon.png"}`}
                                className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className={`flex flex-row w-[88%] h-full justify-start items-center text-xl font-bold tracking-wide
                        ${props.themeChosen === "Dark"
                            ? "bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                            : "text-gray-800"}`}>
                        Add member
                    </div>
                </div>

                {/* Search bar */}
                <div className="relative flex flex-row h-[10%] w-full items-center justify-center px-4 py-1">
                    <div className={`relative w-full h-full rounded-xl overflow-hidden border
                        ${props.themeChosen === "Dark"
                            ? "bg-gray-700/50 border-gray-600"
                            : "bg-gray-100 border-gray-300"}
                        transition-all focus-within:border-[#3B7E9B] focus-within:ring-2 focus-within:ring-[#3B7E9B]/20`}>
                        <input
                            placeholder="Search for username.."
                            value={searchedContact}
                            className={`w-full h-full bg-transparent outline-none px-4 text-base
                                ${props.themeChosen === "Dark"
                                    ? "text-white placeholder:text-gray-400"
                                    : "text-gray-800 placeholder:text-gray-500"}`}
                            onChange={async (e) => {
                                setSearchedContact(e.target.value);
                                await changeFilteredContacts2(e.target.value)
                            }}
                        />
                    </div>
                </div>

                {/* Contacts list */}
                <div className="flex flex-col left-0 top-0 h-[68%] w-full overflow-y-auto scrollbar-hide">
                    {filteredContacts !== null && filteredContacts.map((user, idx) => (
                        <div key={idx}
                            className={`relative flex h-[80px] w-full flex-row px-4 group
                                transition-all duration-300 cursor-pointer
                                ${props.themeChosen === "Dark"
                                    ? "hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/10 border-b border-cyan-500/10"
                                    : "hover:bg-gray-200/70 border-b border-gray-200"}
                                hover:scale-[1.01] active:scale-[0.99]`}
                            onClick={() => {
                                if(!pressedContacts.includes(user)) {setPressedContactsAsync([...pressedContacts, user])}
                                else {removePressedContactsAsync(user)}
                            }}>

                            {/* Checkbox */}
                            <div className="flex flex-row w-[15%] justify-center items-center">
                                <div className={`flex w-6 h-6 rounded-md items-center justify-center
                                    transition-all duration-300
                                    ${pressedContacts.includes(user)
                                        ? 'bg-gradient-to-br from-green-500 to-cyan-500 border-green-400 shadow-lg shadow-green-500/30'
                                        : props.themeChosen === "Dark"
                                            ? 'bg-slate-700/50 border-2 border-cyan-500/30'
                                            : 'bg-gray-200 border-2 border-gray-400'}`}>
                                    {pressedContacts.includes(user) && (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Profile picture */}
                            <div className="flex w-[15%] h-full flex-row justify-center items-center">
                                <div className="relative group/avatar">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-md group-hover/avatar:blur-lg transition-all scale-110" />
                                    {(getProfilePic(user).data !== "") ?
                                        <img
                                            src={`data:image/jpg;base64,${getProfilePic(user).data}`}
                                            className="relative w-12 h-12 rounded-full border-2 border-cyan-400/50 shadow-lg transition-all group-hover/avatar:scale-105"
                                        /> :
                                        <img
                                            src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "./userProfile2.png"}`}
                                            className="relative w-12 h-12 rounded-full border-2 border-cyan-400/50 shadow-lg transition-all group-hover/avatar:scale-105"
                                        />
                                    }
                                </div>
                            </div>

                            {/* User info */}
                            <div className="flex w-[70%] h-full flex-col justify-center py-2">
                                <div className={`flex text-base font-sans font-semibold
                                    ${props.themeChosen === "Dark" ? "text-gray-200" : "text-gray-900"}`}>
                                    {user.username}
                                </div>
                                <div className={`flex text-sm font-sans truncate
                                    ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                                    {user.about}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer with confirm button */}
                <div className={`absolute left-0 bottom-0 h-[12%] w-full flex items-center justify-end px-6
                    ${props.themeChosen === "Dark"
                        ? "bg-transparent"
                        : "bg-gray-200/80 border-t border-gray-300"}`}>

                    {/* Selected count badge */}
                    {pressedContacts.length > 0 && (
                        <div className={`mr-4 px-3 py-1 rounded-full text-sm font-medium
                            ${props.themeChosen === "Dark"
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-gray-300 text-gray-700"}`}>
                            {pressedContacts.length} selected
                        </div>
                    )}

                    {/* Confirm button */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full
                        transition-all cursor-pointer group
                        ${props.themeChosen === "Dark"
                            ? "bg-gradient-to-br from-green-500/80 to-cyan-500/80 hover:from-green-400 hover:to-cyan-400 shadow-lg shadow-green-500/30 hover:shadow-green-400/50"
                            : "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/30"}
                        hover:scale-110 active:scale-95`}
                        onClick={async () => {
                            await insertMembersInGroup();
                            props.setAddToGroup(false);
                        }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
