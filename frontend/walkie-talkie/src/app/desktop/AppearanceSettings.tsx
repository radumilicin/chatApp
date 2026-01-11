import {useState, useEffect} from 'react';

export default function AppearanceSettings(props: any) {
    return (
        <div className={`relative left-[8%] w-[30%] top-[5%] h-[90%] ${props.themeChosen === "Dark" ? "bg-gradient-to-b from-gray-800/90 to-gray-900/95" : "bg-gradient-to-b from-gray-100 to-gray-200"} backdrop-blur-lg rounded-2xl flex flex-col shadow-2xl border ${props.themeChosen === "Dark" ? "border-gray-700/50" : "border-gray-300"}`}>
            <div className={`absolute left-0 top-[1%] h-[5%] w-full flex flex-row ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className={`relative left-[2%] w-[8%] text-2xl font-semibold font-sans flex flex-row justify-center items-center rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-105 active:scale-95`}
                        onClick={() => {
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(true)
                        }}>
                    <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "./back_image_black.png"}`} className={`justify-center items-center w-6 h-6 aspect-square opacity-90`}></img>
                </div>
                <div className={`relative indent-[20px] left-[2%] w-[40%] text-xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-gray-900"} font-sans flex flex-row justify-start items-center`}>Appearance</div>
            </div>
            <div className={`absolute left-0 top-[6%] h-[9%] w-full flex flex-row ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}></div>
            <div className={`absolute left-0 w-full top-[15%] h-[85%] flex flex-col items-center ${props.themeChosen === "Dark" ? "bg-transparent" : "bg-transparent"}`}>
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className={`relative flex flex-row h-[6%] left-[6%] w-[96%] text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? "text-gray-200" : "text-black"}`}>Overall appearance</div>
                    <Theme userObj={props.userObj} themePressed={props.themePressed} setThemePressed={props.setThemePressed} themeChosen={props.themeChosen} setThemeChosen={props.setThemeChosen}></Theme>
                    <div className={`relative flex flex-row top-[4%] h-[6%] left-[6%] w-[96%] text-base lg:text-lg xl:text-xl ${props.themeChosen === "Dark" ? "text-gray-200" : "text-black"}`}>Message</div>
                    <Fonts userObj={props.userObj} fontPressed={props.fontPressed} setFontPressed={props.setFontPressed} fontChosen={props.fontChosen} themeChosen={props.themeChosen}></Fonts>
                </div>
            </div>
        </div>
    );
}

export function Theme(props: any) {

    return (
        <div className={`relative flex flex-row left-[6%] w-[88%] h-[12%] rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-[1.02] active:scale-[0.98]`}
            onClick={() => {props.setThemePressed(!props.themePressed)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} 
                                text-base lg:text-lg items-end font-medium`}>Theme</div>
                <div className={`relative flex flex-row h-[50%] w-full ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-base`}>
                    <div className="relative flex flex-row indent-[20px] h-full text-sm lg:text-base">{props.themeChosen} mode</div>
                    <div className="relative flex flex-row w-[20%] left-[2%] h-full items-center lg:items-start">
                        <img src={`${props.themeChosen === "Dark" ? './crescent_moon_nobg.png' : './sun_icon_black.png'}`} className="flex w-4 h-4 lg:w-6 lg:h-6"></img>
                    </div>
                </div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "./next-arrow-wout-tail-nobg.png" : "./next-arrow-black-nobg.png"}`} className={`w-[10px] h-4 lg:w-3 lg:h-5`}></img>
            </div>
        </div>
    );
}

export function Fonts(props: any) {
    return (
        <div className={`relative flex flex-row top-[4%] left-[6%] w-[88%] h-[12%] rounded-xl hover:cursor-pointer transition-all ${props.themeChosen === "Dark" ? "hover:bg-[#3B7E9B]/20 hover:shadow-lg hover:shadow-[#3B7E9B]/30" : "hover:bg-gray-300/50"} hover:scale-[1.02] active:scale-[0.98]`}
            onClick={() => {props.setFontPressed(!props.fontPressed)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-base lg:text-lg items-end font-medium`}>Fonts</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-sm lg:text-base 
                    ${props.fontChosen === "Sans" ? 'font-sans' : props.fontChosen === "Mono" ? 'font-mono' : 'font-serif'}`}>{props.fontChosen}</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "./next-arrow-wout-tail-nobg.png" : "./next-arrow-black-nobg.png"}`} className={`w-[10px] h-4 lg:w-3 lg:h-5`}></img>
            </div>
        </div>
    );
}
