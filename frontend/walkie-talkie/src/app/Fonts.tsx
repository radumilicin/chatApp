import {useState, useEffect} from 'react'

export default function Fonts(props: any) {


    // const [props.fontChosenPending, props.setFontChosenPending] = useState("")
    const [confirm, setConfirm] = useState(false)
    
    useEffect(() => {
        if(confirm === true) {
            setFontDB()
            // props.setFontChosenPending("")
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
            // props.setFontChosenPending("")
        }
    }

    return (
        <div className={`absolute left-[35%] top-[35%] w-[30%] h-[30%] ${props.themeChosen === "Dark" ? "bg-gray-800" : "bg-gray-400"} rounded-xl z-50 blur-none border-gray-700 border-[1px]`}>
            <div className="relative flex flex-col left-0 w-full h-full">
                <div className={`relative flex flex-row items-center indent-[20px] text-lg ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-semibold h-[20%] w-full`}>Choose Font</div>
                <div className={`left-[20px] relative top-[5%] flex flex-row w-full h-[15%] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} text-base`}>
                    <div className="relative flex flex-row w-10 h-full justify-center items-center">
                        <div className="relative flex flex-row w-6 h-full justify-center items-center hover:cursor-pointer" onClick={() => {
                            if(props.fontChosenPending !== "Sans") props.setFontChosenPending("Sans")
                        }}>
                            {props.fontChosenPending !== "Sans" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                            {props.fontChosenPending === "Sans" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-500 rounded-full"></div>}
                            {props.fontChosenPending === "Sans" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-500 rounded-full"></div>}
                        </div>
                    </div>
                    <div className={`relative flex flex-row indent-[5px] w-[80%] h-full justify-start items-center text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-medium font-sans`}>Sans</div>
                </div>
                <div className="left-[20px] relative top-[5%] flex flex-row w-full h-[15%] text-black text-base">
                    <div className="relative flex flex-row w-10 h-full justify-center items-center">
                        <div className="relative flex flex-row w-6 h-full justify-center items-center hover:cursor-pointer" onClick={() => {
                            if(props.fontChosenPending !== "Serif") props.setFontChosenPending("Serif")
                        }}>
                            {props.fontChosenPending !== "Serif" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                            {props.fontChosenPending === "Serif" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-500 rounded-full"></div>}
                            {props.fontChosenPending === "Serif" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-500 rounded-full"></div>}
                        </div>
                    </div>
                    <div className={`relative flex flex-row indent-[5px] w-[80%] h-full justify-start items-center text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-medium font-serif`}>Serif</div>
                </div>
                <div className="left-[20px] relative top-[5%] flex flex-row w-full h-[15%] text-black text-base">
                    <div className="relative flex flex-row w-10 h-full justify-center items-center">
                        <div className="relative flex flex-row w-6 h-full justify-center items-center hover:cursor-pointer" onClick={() => {
                            if(props.fontChosenPending !== "Mono") props.setFontChosenPending("Mono")
                        }}>
                            {props.fontChosenPending !== "Mono" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                            {props.fontChosenPending === "Mono" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-500 rounded-full"></div>}
                            {props.fontChosenPending === "Mono" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-500 rounded-full"></div>}
                        </div>
                    </div>
                    <div className={`relative flex flex-row indent-[5px] w-[80%] h-full justify-start items-center text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-medium font-mono`}>Mono</div>
                </div>
                <div className="left-[20px] relative top-[20%] flex flex-row w-full h-[10%]">
                    <div className="absolute flex flex-row items-center left-[40%] md:left-[42%] lg:left-[48%] 2xl:left-[55%] top-0 w-[45%] h-full gap-[4%]">
                        <div className="relative flex flex-row left-0 top-0 w-full h-full gap-[14px] lg:gap-[6px]">
                            <div className={`relative flex flex-row w-[45%] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-medium hover:cursor-pointer text-sm xl:text-base justify-center items-center`} onClick={() => {props.setFontPressed(false)}}>Cancel</div>
                            <div className={`relative flex flex-row w-[55%] lg:w-[40%] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} hover:cursor-pointer text-sm xl:text-base font-medium justify-center items-center bg-green-600 rounded-md`} onClick={ async () => { setConfirm(true) }}>Confirm</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}