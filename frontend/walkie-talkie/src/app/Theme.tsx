import {useState, useEffect} from 'react'

export default function Theme(props: any) {


    const [themeChosenPending, setThemeChosenPending] = useState("")
    const [confirm, setConfirm] = useState(false)
    
    useEffect(() => {
        if(confirm === true) {
            setThemeDB()
            setThemeChosenPending("")
            setConfirm(false)
        }
    }, [confirm])

    useEffect(() => {
        if(props.userObj === null || props.themeChosen === "") {
            props.setThemeChosen(props.userObj.font)
            setThemeDB()
        } else {
            props.setThemeChosen("Dark")
        }
    }, [props.userObj])

     useEffect(() => {
        if(props.themeChosen !== "" || props.themeChosen !== null){
            setThemeChosenPending(props.themeChosen)
        }
    }, [props.themeChosen])


    async function setThemeDB() {

        const data = {
            'user': props.curr_user,
            'new_theme': props.themeChosen
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
            props.setThemeChosen(themeChosenPending)
            setThemeChosenPending("")
        }
    }

    return (
        <div className="absolute left-[35%] top-[35%] w-[30%] h-[30%] bg-gray-800 rounded-xl z-50 blur-none">
            <div className="relative flex flex-col left-0 w-full h-full">
                <div className="relative flex flex-row items-center indent-[20px] text-xl text-white font-semibold h-[20%] w-full">Choose Theme</div>
                <div className="left-[20px] relative top-[15%] flex flex-row w-full h-[15%] text-white text-base">
                    <div className="relative flex flex-row w-10 h-full justify-center items-center">
                        <div className="relative flex flex-row w-6 h-full justify-center items-center hover:cursor-pointer" onClick={() => {
                            if(themeChosenPending === "Light") setThemeChosenPending("Dark")
                        }}>
                            {themeChosenPending === "Light" && <div className="absolute w-6 h-6 bg-transparent border-[3px] border-gray-500 rounded-full"></div>}
                            {themeChosenPending === "Dark" && <div className="absolute w-3 h-3 bg-green-500 rounded-full"></div>}
                            {themeChosenPending === "Dark" && <div className="absolute w-6 h-6 bg-transparent rounded-full border-[2px] border-green-500"></div>}
                        </div>
                    </div>
                    <div className="relative flex flex-row indent-[5px] w-[80%] h-full justify-start items-center text-lg text-white font-medium">Dark</div>
                </div>
                <div className="left-[20px] relative top-[15%] flex flex-row w-full h-[15%] text-black text-base">
                    <div className="relative flex flex-row w-10 h-full justify-center items-center">
                        <div className="relative flex flex-row w-6 h-full justify-center items-center hover:cursor-pointer" onClick={() => {
                            if(themeChosenPending === "Dark") setThemeChosenPending("Light")
                        }}>
                            {themeChosenPending === "Dark" && <div className="absolute w-6 h-6 bg-transparent border-[3px] border-gray-500 rounded-full"></div>}
                            {themeChosenPending === "Light" && <div className="absolute w-3 h-3 bg-green-500 rounded-full"></div>}
                            {themeChosenPending === "Light" && <div className="absolute w-6 h-6 bg-transparent rounded-full border-[2px] border-green-500"></div>}
                        </div>
                    </div>
                    <div className="relative flex flex-row indent-[5px] w-[80%] h-full justify-start items-center text-lg text-white font-medium">Light</div>
                </div>
                <div className="left-[20px] relative top-[35%] flex flex-row w-full h-[10%]">
                    <div className="absolute flex flex-row items-center left-[55%] top-0 w-[45%] h-full gap-[4%]">
                        <div className="relative flex flex-row left-0 top-0 w-full h-full">
                            <div className="relative flex flex-row w-[45%] text-white hover:cursor-pointer text-lg font-medium justify-center items-center" onClick={() => {props.setThemePressed(false)}}>Cancel</div>
                            <div className="relative flex flex-row w-[40%] text-white hover:cursor-pointer text-lg font-medium justify-center items-center bg-green-600 rounded-md" onClick={ async () => { setConfirm(true) }}>Confirm</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}