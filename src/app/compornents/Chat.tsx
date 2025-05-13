"use client"

import { 
    addDoc, 
    collection, 
    doc, 
    onSnapshot, 
    orderBy, 
    query, 
    serverTimestamp, 
    Timestamp 
} from "firebase/firestore";

import React, { useEffect, useRef, useState } from "react";
import { GoPaperAirplane } from 'react-icons/go';
import { db } from "../../../firebase";
import { useAppContext } from "@/context/AppContext";
import OpenAI from "openai";
import LoadingIcons from 'react-loading-icons'
import { turborepoTraceAccess } from "next/dist/build/turborepo-access-trace";
// import { Content } from "next/font/google";

type Message = {
    text: string;
    sender: string;
    createdAt: Timestamp;
}

const Chat = () => {

    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
        dangerouslyAllowBrowser: true
    });


    const { selectedRoom, selectedRoomName } = useAppContext();
    const [ inputMessage, setInputMessage ] = useState<string>("");
    const [ messages, setMessages ] = useState<Message[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);

    const scrollDiv = useRef<HTMLDivElement>(null);

    //各ルームにおけるメッセージの取得
    useEffect(() => {
        if (selectedRoom) {
            const fetchMessages = async () => {
                const roomDocRef = doc(db, "rooms", selectedRoom);
                const messagesCollectionRef = collection(roomDocRef, "messages");

                const q = query(messagesCollectionRef, orderBy("createdAt"));


                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
                    setMessages(newMessages);
                });
                            
                return () => {
                    unsubscribe();
                };
            };
            
            fetchMessages();
        };
    }, [ selectedRoom ]);

    useEffect(() => {
        if(scrollDiv.current) {
            const element = scrollDiv.current;
            element.scrollTo({
                top: element.scrollHeight,
                behavior:"smooth",
            });
        }
    }, [messages]);

    const sendMessage = async () => {
        if(!inputMessage.trim()) return;

        const messageData = {
            text: inputMessage,
            sender: "user",
            createdAt: serverTimestamp(),
        };

        //メッセージをFirestoreに保存
        const roomDocRef = doc(db, "rooms", selectedRoom!);
        const messageCollectionRef = collection(roomDocRef, "messages");
        await addDoc(messageCollectionRef, messageData);

        setInputMessage("");
        setIsLoading(true);

        //OpenAIからの返信
        const get3Response = await openai.chat.completions.create({
            messages: [{ role: "user", content: inputMessage }],
            model: "gpt-4.1-mini-2025-04-14",
        });

        setIsLoading(false);

        const botResponse = get3Response.choices[0].message.content;
        await addDoc(messageCollectionRef, {
            text: botResponse,
            sender: "bot",
            createdAt: serverTimestamp(),
        });
    };


    return (
        <div className="bg-gray-500 h-full p-4 flex flex-col">
            <h1 className="text-2x1 text-white font-semibold mb-1">
                {selectedRoomName}
            </h1>
            <div ref={scrollDiv} className="flex-grow overflow-y-auto mb-4">
                {messages.map((message, index) => (
                        <div
                            key={index}
                            className={message.sender === "user" ? "text-right" : "text-left"}
                        >
                            <div 
                                className={
                                    message.sender === "user"
                                        ? "bg-blue-500 inline-block rounded px-4 py-2 mb-2"
                                        : "bg-green-500 inline-block rounded px-4 py-2 mb-2"
                                }
                            >
                                <p className="text-white">{message.text}</p>
                            </div>
                        </div>
                ))}
            { isLoading && <LoadingIcons.Rings />}
            </div>

            <div className="flex-shrink-0 relative">
                <input 
                    type="text"
                    placeholder="Send a Message"
                    className="bg-white border-2 rounded w-full pr-10 focus:outline-none p-2"
                    onChange={(e) => setInputMessage(e.target.value)}
                    value={inputMessage}
                    onKeyDown={(e) =>{
                        if(e.key === "Enter") {
                            sendMessage();
                        }
                    }}
                />
                <button className="absolute inset-y-0 right-4 flex items-center"
                        onClick={() => sendMessage()}
                >
                    <GoPaperAirplane />
                </button>
            </div>
        </div>
    );
};

export default Chat;