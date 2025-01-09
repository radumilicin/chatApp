'use client'

import Image from 'next/image'
import React, {useState} from 'react';

export default function Conversations( props : any) {
    
    const [currentSearch, setCurrSearch] = useState('');

    return (
        <div className="relative left-[5%] w-[30%] top-[10%] h-[80%] bg-[#5CB2AF] rounded-2xl border-white border-2">
            {/* search bar here */}
            <SearchBar currentSearch={currentSearch} setCurrSearch={setCurrSearch}></SearchBar>
            <Contacts currentSearch={currentSearch}></Contacts>
        </div>
    );
}

export function SearchBar( props : any ) {

    return (
        <div className="absolute left-[2%] top-[2%] w-[96%] h-[10%] rounded-t-2xl border-[#f76e6e] border-2 border-t-4 border-x-4 bg-gray-500 bg-opacity-50">
            <div className="relative top-0 left-0 h-full w-full flex flex-row">
                <div className='relative left-0 top-0 w-[10%] h-full flex flex-col justify-center items-center'>
                    <img className='absolute w-[50%] h-[50%]' src="/search.png"></img>
                </div>
                <div className='relative left-[2%] top-0 w-[86%] h-full flex flex-col justify-center items-start indent-2'>
                    <input className="absolute left-0 top-0 w-full h-full outline-none text-black bg-transparent overflow-x-auto" 
                        value={props.currentSearch}
                        onChange={(e) => props.setCurrSearch(e.target.value)} // Update `currentSearch`
                    >
                    </input>
                </div>
            </div>
        </div>
    );
}

export function Contacts( props: any) {
    return (
        <div className="absolute left-[2%] top-[12%] w-[96%] h-[86%] rounded-b-xl border-[#f76e6e] border-4 bg-gray-500 bg-opacity-50">
            {/* here contacts are ordered either by the recency of when we sent or received a message */}
            <div className="relative top-0 left-0 h-full w-full flex flex-col">

            </div>
        </div>
    );
}