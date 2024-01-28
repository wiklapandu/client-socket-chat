import { useEffect, useRef, useState } from "react";
import socket from "@/app/client";
// import {io} from 'socket.io-client';
import ChatConnected from "@/components/chats/connected";
import Image from 'next/image';
import { useRouter } from "next/router";
import axios from "axios";
import moment from "moment";
import TimeChat from "@/components/chats/time";

const Chat = () => {
  const router = useRouter();
  // const socket = io('http://localhost:3060', {reconnection: true, reconnectionAttempts: 5, autoConnect: true});
  const [isClientConnected, setClientConnected] = useState(parseInt(socket.connected) == 1);
  const [execFetch, setExecFetch] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    setName(localStorage.getItem('name'));
    setRoom(localStorage.getItem('room'));
    
    socket.on('connect', () => {
      socket.emit('join_room', localStorage.getItem('room'))
    })

    return () => {
      if(socket) {
        socket.disconnect();
      }
    }
  }, [])

  useEffect(() => {
    socket.connect();

    function onConnect()
    {
      setClientConnected(true);
    }

    function onDisconnect() {
      setClientConnected(false);
    }

    function handleMessageAction(message)
    {
      console.log('running')
      setMessages((prevMessage) => [...prevMessage, message]);
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    socket.emit('join_room', localStorage.getItem('room'));

    socket.on('message', handleMessageAction)
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', handleMessageAction)
    };
  }, [setMessages]);

  useEffect(() => {
    if(!room) return;
  
    (async () => {
      try {
        const response = await axios.get(`http://localhost:3060/room/${room}`);
        setMessages(response.data)
      } catch(error) {
        console.log('failed')
      }
    })();
  }, [room]);

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (!isClientConnected) {
      alert('Please reconnect first to start the chat');
      return;
    }
    socket.connect();
    
    if (newMessage.trim() !== "") {
      const message = {
        text: newMessage,
        sender: name,
        user_id: socket.id,
        senderAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      };

      socket.emit('chatMessage', { message, room });
      // setMessages((prevMessage) => [...prevMessage, message])
      setNewMessage("");
    }
  };

  const handleOutRoom = () => {
    localStorage.removeItem('name');
    localStorage.removeItem('room');
    setRoom('');
    setName('');
    router.push('/');
  };

  const handleReconnect = () => {
    socket.connect();
    setClientConnected(socket.connected);
  };

  const handleDisconnect = () => {
    socket.disconnect();
    setClientConnected(socket.connected);
  };

  return (
    <div className="flex bg-gray-100">
      <div className="xl:w-4/12 md:w-3/4 lg:w-2/3 w-full mx-auto bg-white border-r grid h-screen">
        {/* Header */}
        <div className="p-4 border-b flex items-center">
          <button type="button" onClick={handleOutRoom}>
            <Image src="/backbutton.svg" width={30} height={30} alt="back button" />
          </button>
          <p className="text-lg font-bold mx-3">Room ({room} - {name})</p>
          <ChatConnected isConnected={isClientConnected} />
          <button
            type="button"
            onClick={isClientConnected ? handleDisconnect : handleReconnect}
            className="ml-auto p-4 bg-green-600 rounded-xl text-white hover:scale-95 duration-150 ease-in"
          >
            {isClientConnected ? 'Disconnect' : 'Reconnect'}
          </button>
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
                className={`p-3 max-w-xl w-[50%] rounded-lg ${
                  message.sender === name
                    ? "bg-green-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                <span className={`block font-medium mb-1 ${
                  message.sender === name
                    ? "hidden"
                    : "text-left"
                }`}>{message.sender}</span>
                {message.text}
                <TimeChat time={message.senderAt} />
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
};

export default Chat;
