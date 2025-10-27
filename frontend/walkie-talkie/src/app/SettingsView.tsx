import {useState, useRef} from 'react'

export default function SettingsView(props) {


    return (
        <div className="relative left-[8%] w-[30%] top-[5%] h-[90%] bg-[#637081] border-black border-2 flex flex-col bg-opacity-70">
            <div className="absolute left-[2%] top-[1%] h-[5%] w-[96%] flex flex-row">
                <div className="relative indent-[20px] left-[2%] w-[48%] text-2xl font-semibold text-slate-200 font-sans flex flex-row justify-start items-center">Settings</div>
                {/* Search bar here */}
                    
            </div>
        </div>
    );
}