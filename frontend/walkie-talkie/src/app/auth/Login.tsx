import react, {useState, useEffect, useRef} from 'react'

export default function Login(props) {

    return (
        <div className="absolute left-[30%] top-[15%] h-[70%] bg-gray-800">
            <div className="relative left-0 top-0 h-full w-full flex flex-col gap-4">
                <div className="flex flex-col h-[10%] justify-center items-center">Login</div>
                <div className="flex flex-row w-full h-[15%]">
                    <div className="flex flex-row h-[80%] w-[80%] justify-center items-center">
                        <input required={true} placeholder="Enter your username" className="flex indent-[10px] outline-none bg-gray-600 rounded-xl border-2 border-gray-400"></input>
                    </div>
                </div>
                <div className="flex flex-row w-full h-[15%]">
                    <div className="flex flex-row h-[80%] w-[80%] justify-center items-center">
                        <input type="password" required={true} placeholder="Enter your password" className="flex indent-[10px] outline-none bg-gray-600 rounded-xl border-2 border-gray-400"></input>
                    </div>
                </div>
            </div>
        </div>
    );
}