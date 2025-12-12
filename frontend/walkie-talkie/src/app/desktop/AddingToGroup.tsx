import react, {useEffect, useState, useRef} from 'react'

export default function AddPersonToGroup(props) {

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

        const response = await fetch('http://localhost:3002/insertMembersInGroup', req_options)
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
        <div className={`absolute left-[30%] w-[40%] top-[10%] h-[80%] ${props.themeChosen === "Dark" ? "bg-gray-800" : "bg-gray-300"} rounded-xl border-[2px] border-gray-500 shadow-sm`}>
            <div className="relative top-0 left-0 w-full h-full flex flex-col gap-4">
                <div className="relative flex flex-row h-[8%] w-full bg-slate-500 rounded-t-xl bg-opacity-40">
                    <div className="flex w-[10%] h-full justify-center items-center hover:cursor-pointer" onClick={() => { props.setAddToGroup(false); }}>
                        <img src={`${props.themeChosen === "Dark" ? "./xicon-white.png" : "./xicon.png"}`} className="h-6 w-6"></img>
                    </div>
                    <div className={`flex flex-row w-[85%] h-full justify-start items-center text-xl font-medium ${props.themeChosen === "Dark" ? "text-white" : "text-black" }`}>
                        Add member
                    </div>
                </div>
                <div className="relative flex flex-row h-[6%] w-full items-center justify-center">
                    <input  placeholder="Search for username.." 
                            value={searchedContact} 
                            className={`bg-transparent outline-none h-[50px] w-[90%] indent-[20px] bg-slate-500 rounded-xl bg-opacity-60 ${props.themeChosen === "Dark" ? "text-white" : "text-black"}`}
                            onChange={async (e) => {
                                setSearchedContact(e.target.value); 
                                await changeFilteredContacts2(e.target.value)
                            }}
                        ></input>
                </div>
                <div className="flex flex-col left-0 top-0 h-[86%] w-full overflow-y-scroll scrollbar-hide">
                    {filteredContacts !== null && filteredContacts.map((user, idx) => (
                        <div className={`relative flex h-[100px] w-full flex-row ${props.themeChosen === "Dark" ? "bg-gray-600" : (idx === 0 ? "border-gray-400 border-y-2" : "border-gray-400 border-b-2")} bg-opacity-80 hover:bg-slate-300 hover:bg-opacity-30`} 
                            onClick={() => { 
                                if(!pressedContacts.includes(user)) {setPressedContactsAsync([...pressedContacts, user])} 
                                else {removePressedContactsAsync(user)}    
                            }}>
                            <div className="flex flex-row w-[100px] justify-center items-center">
                                <div className={`flex w-[25px] h-[25px] ${pressedContacts.includes(user) ? 'bg-green-700' : 'bg-gray-700'} border-2 border-gray-300`}></div>
                            </div>
                            <div className={`flex t w-[10%] h-full flex-row justify-start items-center`}>
                                {(getProfilePic(user).data !== "") ? 
                                        <img src={`data:image/jpg;base64,${getProfilePic(user).data}`} className="max-h-[60%] rounded-full"></img> :
                                        <img src={`${props.themeChosen === "Dark" ? "./userProfile_nobg.png" : "./userProfile2.png"}`} className="max-h-[60%] rounded-full"></img>
                                }
                            </div>
                            <div className="flex w-[75%] h-full flex-col justify-start">
                            <div className={`flex h-[50%] indent-[10px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-sans text-sm lg:text-base font-medium items-end overflow-x-hidden`}>{user.username}</div>
                                <div className={`flex h-[50%] indent-[10px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-sans text-xs lg:text-sm xl:text-base items-start overflow-x-hidden`}>{user.about}</div>
                            </div>    
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute left-0 top-[90%] h-[10%] w-full rounded-b-xl bg-slate-500 bg-opacity-40">
                <div className="relative left-[88%] w-[10%] h-full flex flex-row justify-center items-center">
                    <img src="./greenTick2.png" className={`w-[28px] h-[28px] xl:w-8 xl:h-8 aspect-square rounded-full hover:cursor-pointer bg-transparent hover:bg-white`} onClick={ async () => {
                        await insertMembersInGroup(); props.setAddToGroup(false); 
                    }}></img>
                </div>
            </div>
        </div>
    );
}
