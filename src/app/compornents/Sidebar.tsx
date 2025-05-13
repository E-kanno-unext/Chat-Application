"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { IoIosLogOut } from "react-icons/io";
import { collection, orderBy, query, onSnapshot, Timestamp, where, serverTimestamp, addDoc} from "firebase/firestore"
import { auth, db } from "../../../firebase"
// import { unsubscribe } from "diagnostics_channel";
import { useAppContext } from "@/context/AppContext";
import { CiCloudOn } from "react-icons/ci";

type Room = {
    id: string;
    name: string;
    createdAt: Timestamp;
};

const Sidebar = () => {

    const { user, userId, setSelectedRoom, setSelectedRoomName } = useAppContext();

    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        if (user) {
            const fetchRooms = async () => {
                const roomCollectionRef = collection(db, "rooms");
                const q = query(
                    roomCollectionRef, 
                    where("userId", "==", userId),
                    orderBy("createdAt")
                );
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const newRooms: Room[] = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        name: doc.data().name,
                        createdAt: doc.data().createdAt,
                    }));
                    setRooms(newRooms);
                });
    
                return () => {
                    unsubscribe();
                };
            };
    
            fetchRooms();
    
        };
    }, [userId]);


    const selectRoom = (roomId: string, roomName: string) => {
        setSelectedRoom(roomId);
        setSelectedRoomName(roomName);
    };

    const addNewRoom = async () => {
        const roomName = prompt("ルーム名を入力してください。");
        if(roomName) {
            const newRoomRef = collection(db, "rooms");
            await addDoc(newRoomRef, {
                name: roomName,
                userId: userId,
                createdAt: serverTimestamp(),
            });
        }
    }



    const handleLogout = () => {
        auth.signOut();
    };

    return (
        <div className="bg-yellow-200 h-full overflow-auto px-5 flex flex-col">Sidebar
            <div className="flex-grow">
                <div
                    onClick={addNewRoom}
                    className="cursor-pointer flex justify-evenly items-center border border-blue-700 mt-2 rounded-md hover:bg-yellow-50 duration-150"
                >
                    <span className="text-black p-4 text-2xl">＋</span>
                    <h1 className="text-black text-xl font-semibold p-4">New Chat</h1>
                </div>
                <ul>
                    {rooms.map((room) => (
                        <li 
                            key={room.id}
                            className="cursor-pointer border-b border-blue-700 p-4 text-black hover:bg-slate-200 duration-150"
                            onClick={() => selectRoom(room.id, room.name)}
                        >
                            {room.name}
                        </li>
                    ))}
                </ul>
            </div>

            { user && (
                <div className="mb-2 p-4 text-black text-lg font-medium ml-5">
                    {user.email}
                </div>
            )}

            <div onClick={() => handleLogout()} className="text-lg flex items-center justify-evenly mb-2 cursor-pointer p-4 text-late-100 hover:bg-yellow-50 duration-150">
                <IoIosLogOut />
                <span>ログアウト</span>
            </div>
        </div>
    );
};

export default Sidebar;