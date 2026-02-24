import {useEffect, useState} from 'react'
import { API_URL } from '../config'

export default function BlockedContactsView(props: any) {

    function getUserWithId(id) {
        return props.users.find((elem) => elem.id === id)
    }

    function getIdContact(contact) {
        if(contact.sender_id !== props.user) return contact.sender_id
        else return contact.contact_id
    }

    function getImageUser(user: any) {
        if (!user) return { data: "" }
        const image = props.images.find((image: any) => image.id === user.profile_pic_id)
        return image || { data: "" };
    }

    async function unblockUser(contact) {

        const action_by = contact.sender_id === props.user ? "sender" : "receiver"
        const data = {
            'id_contact': contact.id,
            'action_by': action_by,
            'status': "unblock"
        }

        console.log("before sending request to unblock user in client")

        const requestOptions: RequestInit = {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }

        const response = await fetch(`${API_URL}/blockContact`, requestOptions)
        if (response.status === 200) {
            console.log("Unblocked contact " + contact.id)
            await props.fetchContacts()

            let blockedContactsWithoutUnblocked = props.blockedContacts.filter((elem) => elem.id !== contact.id)
            props.setBlockedContacts(blockedContactsWithoutUnblocked)

            props.setDecryptedContacts((currArr) =>
                currArr.map(elem => {
                    if (elem.id === contact.id) {
                        return {
                            ...elem,
                            blocked_by_sender: action_by === "sender" ? false : elem.blocked_by_sender,
                            blocked_by_receiver: action_by === "receiver" ? false : elem.blocked_by_receiver
                        }
                    }
                    return elem
                })
            )
        } else {
            console.log("Error unblocking contact " + contact.id)
        }
    }

    return (
        <div className={`shrink-0 w-[30%] min-w-[400px] h-full ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            {/* Header */}
            <div className="relative w-full pt-4 px-4 pb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                            onClick={() => {
                                props.setPressPrivacy(true)
                                props.setBlockedContactsPressed(false)
                            }}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="w-6 h-6 aspect-square opacity-90" alt="Back" />
                    </div>
                    <h1 className={`text-2xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent`}>
                        Blocked Contacts
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-4">
                <div className="flex flex-col gap-2">
                    { props.blockedContacts.map((elem, idx) => {
                        const user = getUserWithId(getIdContact(elem))
                        const imageData = getImageUser(user)
                        return (
                            <div key={idx}
                                className={`group relative flex items-center gap-4 mx-4 px-4 py-5 rounded-2xl cursor-pointer transition-all duration-300
                                    ${props.themeChosen === "Dark"
                                        ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20"
                                        : "hover:bg-gray-300/50 hover:shadow-lg"}
                                    hover:scale-[1.01] active:scale-[0.99] border border-transparent
                                    ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}>
                                <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all
                                    ${props.themeChosen === "Dark"
                                        ? "bg-[#3B7E9B]/10 group-hover:bg-[#3B7E9B]/20"
                                        : "bg-gray-200 group-hover:bg-gray-300"}`}>
                                    {imageData.data !== "" ? (
                                        <img
                                            src={imageData.data.startsWith('data:image')
                                                ? imageData.data
                                                : `data:image/jpeg;base64,${imageData.data}`}
                                            className={`w-8 h-8 rounded-full border-2 transition-all
                                                ${props.themeChosen === "Dark"
                                                    ? "border-[#3B7E9B]/50 group-hover:border-[#3B7E9B]"
                                                    : "border-gray-400 group-hover:border-gray-600"}
                                                group-hover:scale-105`}
                                            alt="Profile"
                                        />
                                    ) : (
                                        <img
                                            src={`${props.themeChosen === "Dark" ? "./profilePic2.png" : "profilePic_black.png"}`}
                                            className="w-8 h-8 rounded-full opacity-90 transition-all group-hover:scale-105"
                                            alt="Default Profile"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col gap-1 min-w-0">
                                    {user && (
                                        <>
                                            <div className={`text-lg font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight truncate`}>
                                                {user.username}
                                            </div>
                                            <div className={`text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium truncate`}>
                                                {user.about}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all
                                    ${props.themeChosen === "Dark"
                                        ? "hover:bg-[#3B7E9B]/30"
                                        : "hover:bg-gray-400/50"}
                                    hover:scale-110 active:scale-95`}
                                    onClick={async (e) => {
                                        e.stopPropagation()
                                        unblockUser(elem)
                                    }}>
                                    <img src="./unblockIcon-nobg.png" className="w-6 h-6 opacity-90 transition-all group-hover:opacity-100" alt="Unblock" />
                                </div>
                            </div>
                        )
                    })
                    }
                </div>
            </div>
        </div>
    );
}
