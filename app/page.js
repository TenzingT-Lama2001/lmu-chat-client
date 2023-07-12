"use client"
import { io } from "socket.io-client";
import React from 'react';
import axios from "axios";
import * as chatPb from './chat_pb'

export default function Home() {
  const [clientId, setClientId] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const [messageText, setMessageText] = React.useState('');
  const [name, setName] = React.useState('');
  const [accessToken, setAccessToken] = React.useState('');
  const [email, setEmail] = React.useState('tenzing@gmail.com');
  const [password, setPassword] = React.useState('password');
  const [receiverId, setReceiverId] = React.useState('0e1be047-0112-4591-be79-a41885330966');
  const [socket, setSocket] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState()

React.useEffect(() => {
  if (accessToken) {
    const socketInstance = io("http://localhost:3001", {
      auth: {
        token: accessToken,
      },
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('SOCKET CONNECTED', socketInstance.id);
      setClientId(socketInstance.id);
    });

    socketInstance.on('currentUser', data => {
      console.log(data)
      setCurrentUser(data)
    })


    socketInstance.on('previousMessages', (response) => {
      console.log(`Previous messages: ${response}`);
      console.log('repsonse', response)
      
      setMessages(response);

    });

    socketInstance.on('newMessage', (message) => {
      console.log('new msg triggered')
      setMessages(prevMessages => [...prevMessages, message]);


      //decoding the array buffer which is received from the backend
      const decoded = chatPb.Message.deserializeBinary(message.buffer);
      console.log(decoded.array)

    });

    return () => {
      socketInstance.disconnect();
    };
  }
}, [accessToken]);



  const emitSendMessage = async (e) => {
    e.preventDefault();
    console.log(`sender id ${currentUser.userId}`)
    console.log(`receiver id ${receiverId}`)

    const data = {
      text: messageText,
      senderId: currentUser.userId,
      receiverId: receiverId,
      isGroupChat: false,

    }
    socket.emit('sendMessage', data)
    setMessageText('')
  };

  const login = async (e) => {
    e.preventDefault();
    const data = {
      email,password
    }
    try {
      const response = await axios.post("http://localhost:3001/auth/login", data)
      console.log(response.data)
      setAccessToken(response.data.accessToken)
    }
    catch (error) {
        console.log(error)
    }


  }
  const emitJoinRoom = async (e) => {
    console.log(receiverId)
    e.preventDefault();
    const data = { receiver: receiverId };
    socket.emit('joinRoom', data, (response) => {
        console.log(response)
    })
   
  }

  return (
    <main className='flex flex-col min-h-screen w-full items-center justify-center'>
      <div>
        <form onSubmit={(e) => login(e)}>
          <input placeholder="email" value={email } onChange={e => setEmail(e.target.value)} />
          <input placeholder="password" value={password} onChange={ e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
        </form>
        
        <input placeholder="Enter room id" value={ receiverId} onChange={e => setReceiverId(e.target.value)} />
        <button onClick={(e) => emitJoinRoom(e)}>Join</button>
        </div>
        <div className='bg-[#7386FF] w-3/4 h-[70vh] text-white'>
          <div className='p-3 border-b-2 border-white text-center text-2xl'>Chatty Client</div>
          <div className={`bg-[#7386FF] border-b-2 border-white h-4/5`}>
            { messages?.map((message, index) => (
              <div key={index}>
                {message.sender.fullName}: {message.message}
              </div>
            ) )}
          </div>
          <div className=' w-1/2 p-3 bg-white mx-auto mt-1 flex justify-center '>
            <form onSubmit={emitSendMessage} className="flex justify-evenly w-full">
              <input className='w-full h-full p-1.5 text-gray-700 outline-none' placeholder='Enter your text...' value={messageText} onChange={(e) => setMessageText(e.target.value)} />
              <div className='flex'>
                <button className='bg-[#7386FF] p-1 ml-1' type="submit"  >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      
    </main>
  );
}
