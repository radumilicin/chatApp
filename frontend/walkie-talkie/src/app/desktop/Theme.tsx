import {useState, useEffect} from 'react'

export default function Theme(props: any) {

    // const [props.themeChosenPending, props.setThemeChosenPending] = useState("Dark")
    const [confirm, setConfirm] = useState(false)
    
    useEffect(() => {
        if(confirm === true) {
            setThemeDB()
            // props.setThemeChosen(props.themeChosenPending)
            setConfirm(false)
        }
    }, [confirm])

    /* Sets data in DB and also sets the themeChosen from the one that's pending */
    async function setThemeDB() {

        const data = {
            'user': props.curr_user,
            'new_theme': props.themeChosenPending
        }

        const response = await fetch('http://localhost:3002/changeTheme', {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data) 
        })

        if(!response.ok) {
            console.log("Could not update theme in DB")
        } else {
            props.setThemePressed(false)
            props.setThemeChosen(props.themeChosenPending)
            
            // fetch users here so that the new userObj is referenced
            props.fetchUsers()

            // props.setThemeChosenPending("")
        }
    }

    return (
        <div className={`absolute left-[35%] top-[35%] w-[30%] h-[30%] ${props.themeChosen === "Dark" ? "bg-gray-800" : "bg-gray-400"} rounded-xl z-50 blur-none border-gray-700 border-[1px]`}>
            <div className="relative flex flex-col left-0 w-full h-full">
                <div className={`relative flex flex-row items-center indent-[20px] text-lg ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-semibold h-[20%] w-full`}>Choose Theme</div>
                <div className="left-[20px] relative top-[15%] flex flex-row w-full h-[15%] text-white text-base">
                    <div className="relative flex flex-row w-10 h-full justify-center items-center">
                        <div className="relative flex flex-row w-6 h-full justify-center items-center hover:cursor-pointer" onClick={() => {
                            if(props.themeChosenPending === "Light") {
                                props.setThemeChosenPending("Dark")
                                // console.log("Changed to dark")
                            }
                            }}>
                             {props.themeChosenPending === "Light" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                            {props.themeChosenPending === "Dark" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-500 rounded-full"></div>}
                            {props.themeChosenPending === "Dark" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-500 rounded-full"></div>}
                        </div>
                    </div>
                    <div className={`relative flex flex-row indent-[5px] w-[80%] h-full justify-start items-center  text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-medium`}>Dark</div>
                </div>
                <div className="left-[20px] relative top-[15%] flex flex-row w-full h-[15%] text-black text-base">
                    <div className="relative flex flex-row w-10 h-full justify-center items-center">
                        <div className="relative flex flex-row w-6 h-full justify-center items-center hover:cursor-pointer" onClick={() => {
                            if(props.themeChosenPending === "Dark") {
                                props.setThemeChosenPending("Light")
                                // console.log("Changed to light")
                            }
                        }}>
                             {props.themeChosenPending === "Dark" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[3px] border-gray-700 rounded-full"></div>}
                            {props.themeChosenPending === "Light" && <div className="absolute flex flex-row w-2 h-2 xl:w-3 xl:h-3 bg-green-500 rounded-full"></div>}
                            {props.themeChosenPending === "Light" && <div className="absolute flex flex-row w-5 h-5 xl:w-6 xl:h-6 bg-transparent border-[2px] xl:border-[3px] border-green-500 rounded-full"></div>}
                        </div>
                    </div>
                    <div className={`relative flex flex-row indent-[5px] w-[80%] h-full justify-start items-center text-base xl:text-lg ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-medium`}>Light</div>
                </div>
                <div className="left-[20px] relative top-[35%] flex flex-row w-full h-[10%]">
                    <div className="absolute flex flex-row items-center md:left-[42%] lg:left-[48%] 2xl:left-[55%] top-0 w-[45%] h-full gap-[4%]">
                        <div className="relative flex flex-row left-0 top-0 w-full h-full gap-[12px] lg:gap-0">
                            <div className={`relative flex flex-row w-[45%] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} font-medium hover:cursor-pointer text-sm xl:text-base justify-center items-center`} onClick={() => {props.setThemePressed(false)}}>Cancel</div>
                            <div className={`relative flex flex-row w-[55%] lg:w-[40%] ${props.themeChosen === "Dark" ? "text-white" : "text-black"} hover:cursor-pointer text-sm xl:text-base font-medium justify-center items-center bg-green-600 rounded-md`} onClick={ async () => { setConfirm(true) }}>Confirm</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}