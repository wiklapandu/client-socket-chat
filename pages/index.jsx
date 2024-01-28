import Image from "next/image";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem('name');
    const room = localStorage.getItem('room');

    if(name && room) router.push('/chat');
  }, [router])

  const handleLoginRoom = (event) => {
    event.preventDefault();
    localStorage.setItem('name', name)
    localStorage.setItem('room', room)
    router.push('/chat');
  }

  return (
    <main className="flex bg-gray-300">
      <div className="xl:w-4/12 md:w-3/4 grid lg:w-2/3 w-full h-screen bg-white mx-auto shadow-sm shadow-slate-200">
        <div className="mt-auto mb-8">
          <h2 className="text-4xl text-center">Login</h2>
        </div>
        <div className="mb-auto mx-auto w-full grid gap-y-4 max-w-[80%]">
          <label>
            <span className="text-xl mb-2 inline-block">Name</span>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="border w-full p-4 mx-auto rounded-xl" placeholder="Type your room name..."/>
          </label>
          <label>
            <span className="text-xl mb-2 inline-block">Room Name</span>
            <input type="text" value={room} onChange={(event) => setRoom(event.target.value)} className="border w-full p-4 mx-auto rounded-xl" placeholder="Type your room name..."/>
          </label>
          <button onClick={handleLoginRoom} className="p-2 block bg-green-500 text-white rounded-xl">Submit</button>
        </div>
      </div>
    </main>
  );
}
