import {useState, useEffect} from 'react';

export default function AppearanceSettings(props: any) {
    return (
        <div className="relative left-[8%] w-[30%] top-[5%] h-[90%] bg-[#637081] border-black border-2 flex flex-col bg-opacity-70">
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[98%] flex flex-row">
                <div className="relative indent-[20px] left-[2%] w-[8%] text-2xl font-semibold text-black font-sans flex flex-row justify-center items-center hover:bg-slate-400 hover:rounded-xl hover:cursor-pointer" 
                        onClick={() => {
                            props.setPressNotifications(false)
                            props.setPressAccount(false)
                            props.setPressProfile(false)
                            props.setPressAppearance(false)
                            props.setPressedSettings(true)
                        }}>
                    <img src="/back-arrow.png" className="justify-center items-center max-h-[70%] aspect-square"></img>
                </div>
                <div className="relative indent-[20px] left-[2%] w-[40%] text-xl font-semibold text-white font-sans flex flex-row justify-start items-center">Appearance</div>
            </div>

            <div className="absolute left-0 w-full top-[15%] h-[70%] flex flex-col items-center">
                <div className="relative top-0 left-0 flex flex-col w-full h-full gap-4">
                    <div className="relative flex flex-row h-[6%] left-[6%] w-[96%] text-xl text-[#CBD4E0]">Overall appearance</div>
                    <Theme userObj={props.userObj} themePressed={props.themePressed} setThemePressed={props.setThemePressed} themeChosen={props.themeChosen}></Theme>
                    <div className="relative flex flex-row top-[4%] h-[6%] left-[6%] w-[96%] text-xl text-[#CBD4E0]">Message</div>
                    <Fonts userObj={props.userObj} fontPressed={props.fontPressed} setFontPressed={props.setFontPressed} fontChosen={props.fontChosen}></Fonts>
                </div>
            </div>
        </div>
    );
}

export function Theme(props: any) {
    return (
        <div className="relative flex flex-row left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer" 
            onClick={() => {props.setThemePressed(!props.themePressed)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className="relative flex flex-row h-[50%] w-full indent-[20px] text-white text-lg items-end font-medium">Theme</div>
                <div className="relative flex flex-row h-[50%] w-full text-white text-base">
                    <div className="relative flex flex-row indent-[20px] h-full text-base">{props.themeChosen} mode</div>
                    <div className="relative flex flex-row w-[20%] left-[2%] h-full ">
                        <img src={`${props.themeChosen === "Dark" ? './crescent_moon_nobg.png' : './sun_icon_nobg.png'}`} className="flex w-6 h-6"></img>
                    </div>
                </div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src="./next-arrow-wout-tail-nobg.png" className="w-4 h-6"></img>
            </div>
        </div>
    );
}

export function Fonts(props: any) {
    return (
        <div className="relative flex flex-row top-[4%] left-[6%] w-[88%] h-[12%] rounded-xl hover:bg-[#ACCBE1] hover:bg-opacity-40 hover:cursor-pointer"
            onClick={() => {props.setFontPressed(!props.fontPressed)}}>
            <div className="relative flex flex-col w-[80%] h-full">
                <div className="relative flex flex-row h-[50%] w-full indent-[20px] text-white text-lg items-end font-medium">Fonts</div>
                <div className={`relative flex flex-row h-[50%] w-full indent-[20px] text-white text-base 
                    ${props.fontChosen === "Sans" ? 'font-sans' : props.fontChosen === "Mono" ? 'font-mono' : 'font-serif'}`}>{props.fontChosen}</div>
            </div>
            <div className="relative flex flex-col left-[10%] w-[10%] h-full justify-center items-center">
                <img src="./next-arrow-wout-tail-nobg.png" className="w-4 h-6"></img>
            </div>
        </div>
    );
}
