export default function AppearanceSettings(props: any) {
    return (
        <div className={`relative left-0 w-full top-0 h-full ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"} overflow-y-auto no-scrollbar`}>
            {/* Header */}
            <div className="relative w-full pt-4 px-4 pb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                            onClick={() => {
                                props.setPressedSettings(true)
                                props.setPressAppearance(false)
                            }}>
                        <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "back_image_black.png"}`} className="w-5 h-5 xss:w-6 xss:h-6 aspect-square opacity-90" alt="Back" />
                    </div>
                    <h1 className={`text-xl xss:text-2xl font-bold bg-gradient-to-r ${props.themeChosen === "Dark" ? "from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" : "from-gray-700 to-gray-900"} bg-clip-text text-transparent`}>
                        Appearance
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex flex-col gap-6">
                    {/* Overall Appearance Section */}
                    <div className="flex flex-col gap-3">
                        <h2 className={`text-xs xss:text-sm font-semibold uppercase tracking-wide ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Overall appearance
                        </h2>
                        <Theme userObj={props.userObj} themePressed={props.themePressed} setThemePressed={props.setThemePressed} themeChosen={props.themeChosen} setThemeChosen={props.setThemeChosen}></Theme>
                    </div>

                    {/* Message Section */}
                    <div className="flex flex-col gap-3">
                        <h2 className={`text-xs xss:text-sm font-semibold uppercase tracking-wide ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Message
                        </h2>
                        <Fonts userObj={props.userObj} fontPressed={props.fontPressed} setFontPressed={props.setFontPressed} fontChosen={props.fontChosen} themeChosen={props.themeChosen}></Fonts>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Theme(props: any) {

    return (
        <div className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {props.setThemePressed(!props.themePressed)}}>
            <div className="flex-1 flex flex-col gap-1">
                <div className={`text-sm xss:text-base font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Theme
                </div>
                <div className="flex items-center gap-2">
                    <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium`}>
                        {props.themeChosen} mode
                    </div>
                    <img src={`${props.themeChosen === "Dark" ? './crescent_moon_nobg.png' : './sun_icon_black.png'}`} className="w-4 h-4" alt={props.themeChosen} />
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}

export function Fonts(props: any) {
    return (
        <div className={`group flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-xl hover:shadow-[#3B7E9B]/20" : "hover:bg-gray-300/50 hover:shadow-lg"} hover:scale-[1.01] active:scale-[0.99] border border-transparent ${props.themeChosen === "Dark" ? "hover:border-[#3B7E9B]/30" : "hover:border-gray-400/30"}`}
            onClick={() => {props.setFontPressed(!props.fontPressed)}}>
            <div className="flex-1 flex flex-col gap-1">
                <div className={`text-sm xss:text-base font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} tracking-tight`}>
                    Fonts
                </div>
                <div className={`text-xs xss:text-sm ${props.themeChosen === "Dark" ? "text-gray-400" : "text-gray-600"} font-medium ${props.fontChosen === "Sans" ? 'font-sans' : props.fontChosen === "Mono" ? 'font-mono' : 'font-serif'}`}>
                    {props.fontChosen}
                </div>
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${props.themeChosen === "Dark" ? "text-[#3B7E9B]" : "text-gray-700"}`}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}