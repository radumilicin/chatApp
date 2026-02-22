import {useEffect, useRef} from 'react'

export default function ProfilePicPrivacyVertical(props: any) {

    const first = useRef(false)

    useEffect(() => {
        if(!first.current) {
            first.current = true
            return
        }

        changeVisibilityProfilePic()
    }, [props.visibilityProfilePic])

    useEffect(() => {
        if(props.userObj !== null) props.setVisibilityProfilePic(props.userObj.profile_pic_visibility)
        else props.setVisibilityProfilePic("Everyone")
    }, [props.userObj])

    async function changeVisibilityProfilePic() {

        const data = {
            'user': props.user,
            'new_visibility': props.visibilityProfilePic
        }

        const resp = await fetch("http://localhost:3002/changeProfilePicVisibility", {
            method: 'PUT',
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        if(resp.ok){
            console.log("Visibility changed successfuly in the server")
            props.fetchUsers()
        } else {
            console.error("Error could not update ")
        }
    }

    return (
        <div className={`relative left-0 w-full top-0 h-full ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"} overflow-y-auto no-scrollbar`}>
            {/* Header */}
            <div className="relative w-full pt-4 px-4 pb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                            onClick={() => {
                                props.setPressPrivacy(true)
                                props.setProfilePicPrivPress(false)
                            }}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className="w-5 h-5 xss:w-6 xss:h-6 aspect-square opacity-90" alt="Back" />
                    </div>
                    <h1 className={`text-xl xss:text-2xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent`}>
                        Profile Picture Privacy
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex flex-col gap-6">
                    {/* Visibility Section */}
                    <div className="flex flex-col gap-4">
                        <h2 className={`text-sm font-semibold uppercase tracking-wide ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Who can see your profile picture
                        </h2>
                        <div className="flex flex-col gap-[2px]">
                            <RadioOption
                                label="Everyone"
                                selected={props.visibilityProfilePic === "Everyone"}
                                onClick={() => props.setVisibilityProfilePic("Everyone")}
                                themeChosen={props.themeChosen}
                            />
                            <RadioOption
                                label="Contacts"
                                selected={props.visibilityProfilePic === "Contacts"}
                                onClick={() => props.setVisibilityProfilePic("Contacts")}
                                themeChosen={props.themeChosen}
                            />
                            <RadioOption
                                label="Nobody"
                                selected={props.visibilityProfilePic === "Nobody"}
                                onClick={() => props.setVisibilityProfilePic("Nobody")}
                                themeChosen={props.themeChosen}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RadioOption(props: { label: string, selected: boolean, onClick: () => void, themeChosen: string }) {
    return (
        <div
            className={`group flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={props.onClick}
        >
            <div className="relative flex items-center justify-center w-8 h-8">
                {props.selected && (
                    <>
                        <div className="absolute w-8 h-8 bg-[#3B7E9B]/20 rounded-full blur-md animate-pulse"></div>
                        <div className="absolute w-3 h-3 bg-[#3B7E9B] rounded-full shadow-[0_0_20px_rgba(59,126,155,0.8)]"></div>
                        <div className="absolute w-6 h-6 rounded-full border-[3px] border-[#3B7E9B] shadow-[0_0_15px_rgba(59,126,155,0.6)]"></div>
                    </>
                )}
            </div>
            <div className={`flex-1 text-base font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                {props.label}
            </div>
        </div>
    );
}