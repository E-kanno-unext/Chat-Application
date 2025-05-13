"use client";

import Image from "next/image";
import Chat from "./compornents/Chat";
import Sidebar from "./compornents/Sidebar";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {

  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if ( !user ) {
      router.push("/auth/login");
    }
  }, [ user, router ]);


  return (
    <div className="flex h-screen justify-center items-center">
      <div className="h-full flex" style={{ width: "1280px" }}>
        <div className="w-1/5 h-full border-r">
          <Sidebar />
        </div>
        <div className="w-4/5 h-full">
          <Chat />
        </div>
      </div>
    </div>
  );
}