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
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            {/* Header */}
            <div className="relative w-full pt-4 px-4 pb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
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
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="w-6 h-6 aspect-square opacity-90" alt="Back" />
                    </div>
                    <h1 className={`text-2xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent`}>
                        Blocked Contacts
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex flex-col gap-3">
                    { props.blockedContacts.map((elem, idx) => {
                        return (
                            <div key={idx} className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}>
                                <div className="flex items-center justify-center w-12 h-12">
                                    {getImageUser(getUserWithId(getIdContact(elem))).data !== "" ? <img
                                    src={`data:image/jpg;base64,${getImageUser(getUserWithId(getIdContact(elem))).data}`}
                                    className="w-12 h-12 rounded-full"
                                    alt="Profile" /> :
                                    <img src="./profilePic2.png" className="w-12 h-12 rounded-full" alt="Profile" />}
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <div className={`text-base font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                                        {getUserWithId(getIdContact(elem)).username}
                                    </div>
                                    <div className={`text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                                        {getUserWithId(getIdContact(elem)).about}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/30" : "hover:bg-gray-400/50"} hover:scale-110 active:scale-95`} onClick={async (e) => {
                                        e.stopPropagation()
                                        unblockUser(getIdContact(elem))
                                    }}>
                                        <img src="./unblockIcon-nobg.png" className="w-6 h-6" alt="Unblock" />
                                    </div>
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
