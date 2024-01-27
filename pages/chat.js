import { useEffect, useRef, useState } from "react";
import socketClient from "@/app/client";
import Image from 'next/image';
import { useRouter } from "next/router";

export default function Chat() {
  const router = useRouter();
  const socketRef = useRef(socketClient);
  const [isClientConnected, setClientConnected] = useState(socketClient.connected);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [name, setName] = useState();
  const [room, setRoom] = useState();

  useEffect(() => {
    const roomId = localStorage.getItem('room');
    fetch(`http://localhost:3060/room/${roomId}`, {
      method: 'GET'
    }).then(data => data.json()).then((data) => {
      setMessages(data)
    })
  }, [])

  useEffect(() => {
    const socket  = socketRef.current;

    setName(localStorage.getItem('name'))
    setRoom(localStorage.getItem('room'))
    socket.on('connect', () => {
      socket.emit('join_room', localStorage.getItem('room'))
      setClientConnected(socket.connected);
    })
      
    socket.on('message', (message) => {
      setMessages([...messages, message])
    })
    
  }, [setName, setMessages, messages]);

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (newMessage.trim() !== "") {      
      const message = {
        message: { text: newMessage, sender: name, user_id: 1 },
        room: room,
      }
      socketRef.current.emit('message', message);
      setNewMessage("");
    }
  };

  const handleOutRoom = () => {
    localStorage.removeItem('name')
    localStorage.removeItem('room')
    setRoom('');
    setName('');
    router.push('/')
  }

  return (
    <div className="flex bg-gray-100">
      <div className="xl:w-4/12 md:w-3/4 lg:w-2/3 mx-auto bg-white border-r grid h-screen">
        {/* Header */}
        <div className="p-4 border-b flex items-center">
          <button type="button" onClick={handleOutRoom}>
            <Image src={"/backbutton.svg"} width={30} height={30} alt="back button" />
          </button>
          <p className="text-lg font-bold ml-3">Room ({room})</p>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 h-[70vh] overflow-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 ${
                message.sender === name
                  ? "flex justify-end"
                  : "flex justify-start"
              }`}
            >
              <div
                className={`p-3 max-w-xs rounded-lg ${
                  message.sender === name
                    ? "bg-green-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 mx-4 mt-auto mb-8 pt-4 items-center border-t border-gray-300">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="p-2 focus:outline-none border rounded-md"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 p-3 bg-green-500 text-white rounded-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
