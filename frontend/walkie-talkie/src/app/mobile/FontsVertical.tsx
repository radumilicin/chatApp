import {useState, useEffect} from 'react'

export default function FontsVertical(props: any) {

    const [confirm, setConfirm] = useState(false)

    useEffect(() => {
        if(confirm === true) {
            setFontDB()
            setConfirm(false)
        }
    }, [confirm])

    async function setFontDB() {

        const data = {
            'user': props.curr_user,
            'new_font': props.fontChosenPending
        }

        const response = await fetch('http://localhost:3002/changeFont', {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        if(!response.ok) {
            console.log("Could not update font in DB")
        } else {
            props.setFontPressed(false)
            props.setFontChosen(props.fontChosenPending)
        }
    }

    return (
        <>
            {/* Backdrop overlay with blur */}
            <div className={`fixed inset-0 ${props.themeChosen === "Dark" ? "bg-black/60" : "bg-gray-900/40"} backdrop-blur-md z-40`} onClick={() => props.setFontPressed(false)} />

            {/* Modal */}
            <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[450px] h-auto
                ${props.themeChosen === "Dark"
                    ? "bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98"
                    : "bg-gradient-to-b from-gray-100 to-gray-200"}
                backdrop-blur-xl rounded-3xl z-50 shadow-2xl
                border-2 ${props.themeChosen === "Dark" ? "border-cyan-500/30" : "border-gray-300"}
                animate-in fade-in-0 zoom-in-95 duration-200`}>

                {/* Animated glow effect */}
                <div className={`absolute inset-0 rounded-3xl ${props.themeChosen === "Dark" ? "bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 opacity-50" : "bg-gradient-to-br from-cyan-400/15 via-blue-400/10 to-purple-400/15 opacity-40"}`} />

                <div className="relative flex flex-col left-0 w-full h-full p-6 gap-6">
                    {/* Header with gradient text */}
                    <div className={`relative flex flex-row items-center text-xl xss:text-2xl font-bold
                        bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent
                        drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]`}>
                        Choose Font
                    </div>
                    {/* Font options */}
                    <div className="flex flex-col gap-3">
                        {/* Sans option */}
                        <div className={`group flex flex-row items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300
                            ${props.fontChosenPending === "Sans"
                                ? props.themeChosen === "Dark"
                                    ? "bg-cyan-500/20 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                                    : "bg-gray-300/40 border-2 border-gray-300 hover:bg-gray-300/50 hover:shadow-lg"
                                : props.themeChosen === "Dark"
                                    ? "border-2 border-slate-700/50 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                                    : "border-2 border-gray-300 hover:border-gray-400/30 hover:bg-gray-200/50"
                            }
                            hover:scale-[1.02] active:scale-[0.98]`}
                            onClick={() => {
                                if(props.fontChosenPending !== "Sans") props.setFontChosenPending("Sans")
                            }}>

                            {/* Radio button */}
                            <div className="relative flex items-center justify-center w-6 h-6">
                                {props.fontChosenPending === "Sans" ? (
                                    <>
                                        <div className="absolute w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse" />
                                        <div className="absolute w-6 h-6 border-3 border-cyan-400 rounded-full" />
                                    </>
                                ) : (
                                    <div className={`absolute w-6 h-6 border-3 ${props.themeChosen === "Dark" ? "border-slate-600" : "border-gray-400"} rounded-full`} />
                                )}
                            </div>

                            {/* Label */}
                            <div className={`text-base xss:text-lg font-semibold font-sans ${props.themeChosen === "Dark" ? "text-cyan-100" : "text-gray-800"}`}>
                                Sans
                            </div>
                        </div>

                        {/* Serif option */}
                        <div className={`group flex flex-row items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300
                            ${props.fontChosenPending === "Serif"
                                ? props.themeChosen === "Dark"
                                    ? "bg-cyan-500/20 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                                    : "bg-gray-300/40 border-2 border-gray-300 hover:bg-gray-300/50 hover:shadow-lg"
                                : props.themeChosen === "Dark"
                                    ? "border-2 border-slate-700/50 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                                    : "border-2 border-gray-300 hover:border-gray-400/30 hover:bg-gray-200/50"
                            }
                            hover:scale-[1.02] active:scale-[0.98]`}
                            onClick={() => {
                                if(props.fontChosenPending !== "Serif") props.setFontChosenPending("Serif")
                            }}>

                            {/* Radio button */}
                            <div className="relative flex items-center justify-center w-6 h-6">
                                {props.fontChosenPending === "Serif" ? (
                                    <>
                                        <div className="absolute w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse" />
                                        <div className="absolute w-6 h-6 border-3 border-cyan-400 rounded-full" />
                                    </>
                                ) : (
                                    <div className={`absolute w-6 h-6 border-3 ${props.themeChosen === "Dark" ? "border-slate-600" : "border-gray-400"} rounded-full`} />
                                )}
                            </div>

                            {/* Label */}
                            <div className={`text-base xss:text-lg font-semibold font-serif ${props.themeChosen === "Dark" ? "text-cyan-100" : "text-gray-800"}`}>
                                Serif
                            </div>
                        </div>

                        {/* Mono option */}
                        <div className={`group flex flex-row items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300
                            ${props.fontChosenPending === "Mono"
                                ? props.themeChosen === "Dark"
                                    ? "bg-cyan-500/20 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                                    : "bg-gray-300/40 border-2 border-gray-300 hover:bg-gray-300/50 hover:shadow-lg"
                                : props.themeChosen === "Dark"
                                    ? "border-2 border-slate-700/50 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                                    : "border-2 border-gray-300 hover:border-gray-400/30 hover:bg-gray-200/50"
                            }
                            hover:scale-[1.02] active:scale-[0.98]`}
                            onClick={() => {
                                if(props.fontChosenPending !== "Mono") props.setFontChosenPending("Mono")
                            }}>

                            {/* Radio button */}
                            <div className="relative flex items-center justify-center w-6 h-6">
                                {props.fontChosenPending === "Mono" ? (
                                    <>
                                        <div className="absolute w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse" />
                                        <div className="absolute w-6 h-6 border-3 border-cyan-400 rounded-full" />
                                    </>
                                ) : (
                                    <div className={`absolute w-6 h-6 border-3 ${props.themeChosen === "Dark" ? "border-slate-600" : "border-gray-400"} rounded-full`} />
                                )}
                            </div>

                            {/* Label */}
                            <div className={`text-base xss:text-lg font-semibold font-mono ${props.themeChosen === "Dark" ? "text-cyan-100" : "text-gray-800"}`}>
                                Mono
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="relative flex flex-row justify-end items-center w-full gap-3 pt-4">
                        <div className={`flex flex-row px-5 xss:px-6 py-2.5 ${props.themeChosen === "Dark" ? "text-cyan-200 hover:bg-cyan-500/20" : "text-gray-700 hover:bg-gray-300/50"} font-semibold hover:cursor-pointer text-sm xss:text-base justify-center items-center rounded-xl transition-all hover:scale-105 active:scale-95 border ${props.themeChosen === "Dark" ? "border-cyan-500/30" : "border-gray-300"}`} onClick={() => {props.setFontPressed(false)}}>
                            Cancel
                        </div>
                        <div className={`flex flex-row px-5 xss:px-6 py-2.5 text-white hover:cursor-pointer text-sm xss:text-base font-semibold justify-center items-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105 active:scale-95`} onClick={ async () => { setConfirm(true) }}>
                            Confirm
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
