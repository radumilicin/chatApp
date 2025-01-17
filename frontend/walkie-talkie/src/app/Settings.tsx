import react, {useState, useEffect} from 'react';


export default function OptionsBar(props){
    return (    
        <div className="absolute left-[3%] top-[5%] w-[5%] h-[90%] bg-gray-800 rounded-l-xl flex flex-col"> 
            <div className="relative flex flex-col h-[50%] w-full">
                <div className="w-full top-0 h-[20%] hover:bg-gray-500 hover:rounded-tl-xl relative flex flex-col items-center justify-center" onClick={() => {props.setPressProfile(false)}}>
                    <img src="./messageIcon2.png" className="flex w-[100%] h-[100%] hover:bg-gray-500 hover:rounded-full"></img>
                </div>
            </div>
            <Settings curr_user={props.curr_user} users={props.users} images={props.images} setPressProfile={props.setPressProfile}></Settings>
        </div>
    );
}

export function Settings(props) {

    const [imageData, setImageData] = useState({'data' : ""}) 

    // type user is either current or other (0,1)
    function getProfileImage() {
        const user = props.users.find((user) => {
            return user.id === props.curr_user
        })
        const image = props.images.find((image: any) => image.id === user.profile_pic_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    useEffect(() => {
        setImageData(getProfileImage())
    }, [props.users, props.images])

    return (
        <div className="relative flex flex-col h-[50%] rounded-bl-2xl w-full">
            <div className="w-full h-[20%] top-[60%] hover:bg-gray-500 relative flex flex-col items-center justify-center">
                <img src="./whiteCog.png" className="flex w-[70%] h-[70%] hover:bg-gray-500" onClick={() => {}}></img>
            </div>
            <div className="w-full h-[20%] top-[60%] hover:rounded-bl-xl hover:bg-gray-500 relative flex flex-col items-center justify-center" onClick={() => {props.setPressProfile(true)}}>
                {imageData.data !== "" ? <img src={`data:image/jpg;base64,${imageData.data}`} className="flex w-[70%] h-[70%] hover:bg-gray-500 rounded-full" onClick={() => {}}></img>
                                               : <img src="./profilePic2.png" className="flex w-[70%] h-[70%] hover:bg-gray-500 rounded-full"></img>
                }
            </div>
        </div>
    );    
}