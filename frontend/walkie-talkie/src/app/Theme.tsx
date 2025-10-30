import {useState, useEffect} from 'react'

export default function Theme(props: any) {

    return (
        <div className="absolute left-[30%] top-[35%] w-[35%] h-[30%] bg-white rounded-xl z-50">
            <div className="relative flex flex-col left-0 w-full h-full">
                <div className="indent-[20px] text-lg text-black font-medium h-[20%] w-full">Choose Theme</div>
                <div className="indent-[20px] relative flex flex-row w-full h-[20%] text-black text-base">Dark</div>
                <div className="indent-[20px] relative flex flex-row w-full h-[20%] text-black text-base">Light</div>
                <div className="indent-[20px] relative flex flex-row w-full h-[20%] text-black text-base hover:cursor-pointer" onClick={() => {props.setThemePressed(false)}}>Cancel</div>
            </div>
        </div>
    );
}