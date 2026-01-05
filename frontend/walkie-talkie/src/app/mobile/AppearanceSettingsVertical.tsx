import {useState, useEffect} from 'react';

export default function AppearanceSettings(props: any) {
    return (
        <div className={`relative left-0 w-full top-0 h-[90%] ${props.themeChosen === "Dark" ? "bg-[#323232] bg-opacity-60 border-[#0D1317] " : "bg-gray-300 border-gray-400 shadow-lg border-2"} border-black border-2 flex flex-col`}>
            <div className="absolute left-0 top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className={`relative indent-[20px] left-[2%] w-[8%] text-lg font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "hover:bg-opacity-30"} hover:rounded-xl hover:cursor-pointer`} 
                        onClick={() => {
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(true)
                        }}>
                    <img src={`${props.themeChosen === "Dark" ? "./back-arrow.png" : "back_image_black.png"}`} className="justify-center items-center max-h-[70%] aspect-square"></img>
                </div>
                <div className={`relative indent-[10px] left-[2%] w-[40%] text-xl font-semibold ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-sans flex flex-row justify-start items-center`}>Appearance</div>
            </div>

            <div className="absolute left-0 w-full top-[15%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className={`relative flex flex-row h-[6%] left-[6%] w-[96%] text-sm xss:text-base ${props.themeChosen === "Dark" ? "text-gray-200" : "text-black"}`}>Overall appearance</div>
                    <Theme userObj={props.userObj} themePressed={props.themePressed} setThemePressed={props.setThemePressed} themeChosen={props.themeChosen} setThemeChosen={props.setThemeChosen}></Theme>
                    <div className={`relative flex flex-row top-[4%] h-[6%] left-[6%] w-[96%] text-sm xss:text-base ${props.themeChosen === "Dark" ? "text-gray-200" : "text-black"}`}>Message</div>
                    <Fonts userObj={props.userObj} fontPressed={props.fontPressed} setFontPressed={props.setFontPressed} fontChosen={props.fontChosen} themeChosen={props.themeChosen}></Fonts>
                </div>
            </div>
        </div>
    );
}

export function Theme(props: any) {

    return (
        <div className={`relative flex flex-row left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40" : "border-gray-400 border-2 hover:bg-opacity-30"} hover:cursor-pointer`} 
            onClick={() => {props.setThemePressed(!props.themePressed)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} 
                                text-sm xss:text-base items-end font-medium`}>Theme</div>
                <div className={`relative flex flex-row h-[50%] w-full ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-base`}>
                    <div className="relative flex flex-row indent-[20px] h-full text-xs xss:text-sm">{props.themeChosen} mode</div>
                    <div className="relative flex flex-row w-[20%] left-[2%] h-full items-start">
                        <img src={`${props.themeChosen === "Dark" ? './crescent_moon_nobg.png' : './sun_icon_black.png'}`} className="flex w-4 h-4 xss:w-5 xss:h-5"></img>
                    </div>
                </div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "./next-arrow-wout-tail-nobg.png" : "./next-arrow-black-nobg.png"}`} className="w-[10px] h-4 xss:w-3 xss:h-5"></img>
            </div>
        </div>
    );
}

export function Fonts(props: any) {
    return (
        <div className={`relative flex flex-row top-[4%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-gray-500 ${props.themeChosen === "Dark" ? "hover:bg-opacity-40 " : "border-gray-400 border-2 hover:bg-opacity-30"} hover:cursor-pointer`}
            onClick={() => {props.setFontPressed(!props.fontPressed)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-sm xss:text-base items-end font-medium`}>Fonts</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-xs xss:text-sm 
                    ${props.fontChosen === "Sans" ? 'font-sans' : props.fontChosen === "Mono" ? 'font-mono' : 'font-serif'}`}>{props.fontChosen}</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src={`${props.themeChosen === "Dark" ? "./next-arrow-wout-tail-nobg.png" : "./next-arrow-black-nobg.png"}`} className="w-[10px] h-4 xss:w-3 xss:h-5"></img>
            </div>
        </div>
    );
}
