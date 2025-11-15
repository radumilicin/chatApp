import {useEffect, useState} from 'react'

export default function BlockedContactsView(props: any) {

    function getUserWithId(id) {
        return props.users.find((elem) => elem.id === id)
    }

    function getIdContact(contact) {
        if(contact.sender_id !== props.user) return contact.sender_id
        else return contact.contact_id
    }

    function getImageUser(user: any) {
        const image = props.images.find((image: any) => image.user === user.id)
        return image || { data: "" }; // Ensure we return a fallback value
    }

    async function unblockUser(user_id) {

        const data = {
            'curr_user': props.user,
            'contact_id': user_id,
            'status': "unblock"
        }

        console.log("before sending request to unblock user in client")

        const resp = await fetch(`http://localhost:3002/blockContact`, {
            method: 'PUT',
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        if(resp.ok) {
            console.log("Unblocked user")

            let blockedContactsWithoutUnblocked = props.blockedContacts.filter((elem) => !((elem.sender_id === user_id && elem.contact_id === props.user) || 
                                                                                         (elem.sender_id === props.user && elem.contact_id === user_id)))
            props.setBlockedContacts(blockedContactsWithoutUnblocked)
            props.fetchContacts()
        } else {
            console.log("Unblocking failed")
        }
    }

    return (
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-[#323232] bg-opacity-60 border-[#0D1317] " : "bg-gray-300 border-gray-400 shadow-lg border-2"} border-black border-2 flex flex-col`}>
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className={`relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:cursor-pointer hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} rounded-xl`} 
                        onClick={() => {
                            props.setPressPrivacy(true)
                            props.setPressedSettings(false)
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
                    <img src={`${props.themeChosen === "Dark" ? "/back-arrow.png" : "back_image_black.png"}`} className="justify-center items-center max-h-[70%] aspect-square"></img>
                </div>
                <div className={`relative indent-[10px] w-[90%] text-base lg:text-lg xl:text-xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-sans flex flex-row justify-start items-center`}>Blocked Contacts</div>
            </div>
            <div className="relative top-[15%] flex flex-col left-[2%] w-[96%] h-[80%]">
                { props.blockedContacts.map((elem, idx) => {
                    return (
                        <div key={idx} className="relative flex flex-row w-full h-[12%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-20">
                            <div className="relative flex flex-row w-[15%] h-full justify-center items-center">
                                {/* <img src={`${}profilePic.png`} className="w-8 h-8"></img> */}
                                {getImageUser(getUserWithId(getIdContact(elem))).data !== "" ? <img
                                src={`data:image/jpg;base64,${getImageUser(getUserWithId(getIdContact(elem))).data}`}
                                className="h-[75%] w-[75%] rounded-full"
                                alt="Profile"></img> : 
                                <img src="./profilePic2.png" className="h-[75%] w-[75%] rounded-full"></img>}
                            </div>
                            <div className="relative flex flex-col w-[70%] justify-center items-center">
                                <div className="relative flex flex-row h-[50%] w-full items-end text-lg">{getUserWithId(getIdContact(elem)).username}</div>
                                <div className="relative flex flex-row h-[50%] w-full items-start">{getUserWithId(getIdContact(elem)).about}</div>
                            </div>
                            <div className="relative flex flex-row w-[15%] justify-center items-center hover:cursor-pointer">
                                <div className="relative flex flex-row w-10 h-10 justify-center items-center hover:bg-slate-400 hover:rounded-xl" onClick={async () => {
                                    unblockUser(getIdContact(elem))  
                                }}>
                                    <img src="./unblockIcon-nobg.png" className="flex flex-row justify-center items-center w-6 h-6"></img>

                                </div>
                            </div>
                        </div>
                    )
                })  
                }
            </div>
        </div>
    );
}
