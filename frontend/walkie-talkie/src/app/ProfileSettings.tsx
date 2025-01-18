import react, {useState, useEffect} from 'react'

export default function ProfileSettings(props) {

    // type user is either current or other (0,1)
    function getProfileImage() {
        const user = props.users.find((user) => {
            return user.id === props.curr_user
        })
        const image = props.images.find((image: any) => image.id === user.image_id);
        return image || { data: "" }; // Ensure we return a fallback value
    }

    return (
        <div className="relative left-[8%] w-[30%] top-[10%] h-[80%] bg-[#7DD8C3] rounded-r-xl border-white border-2 flex flex-col">
            <div className="relative flex flex-row top-[5%] left-[15%] w-[70%] h-[50%] bg-gray-700 justify-center items-center rounded-full">
                {getProfileImage().data !== "" ? <img src={`data:image/jpeg,jpg,png;base64",${getProfileImage().data}`} className="h-[70%] w-[70%]"></img>
                                          : <img src="./profilePic2.png" className="h-[70%] w-[70%]"></img>
                }
            </div>
        </div>
    );
}