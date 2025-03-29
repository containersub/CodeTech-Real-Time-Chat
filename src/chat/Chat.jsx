import React, { useEffect, useRef, useState } from 'react'
import './chat.css'
import { FaVideo } from "react-icons/fa";
import { MdCall } from "react-icons/md";
import { FaRegImage } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa";
import { BsFillEmojiSmileFill } from "react-icons/bs";
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';
import { useChatStore } from '../firebase/chatStore';
import { useUserStore } from '../firebase/userStore';

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { chatId, user, } = useChatStore();
    let{isCurrentUserBlocked,isReceiverBlocked}=useChatStore()
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    if (!chatId) return;
    
    const unSub = onSnapshot(
      doc(fireDB, "chats", chatId),
      (res) => {
        setChat(res.data());
      }
    );
    return () => unSub();
  }, [chatId]);

  const handleEmoji = (emoji) => {
    setText((prev) => prev + emoji.emoji);
    setOpen(false);
  }

  const handleSend = async () => {
    if (!text.trim() || !currentUser || !user) return;

    try {
      const message = {
        senderId: currentUser.uid, // Changed from id to uid
        text: text.trim(),
        createdAt: new Date(),
      };

      await updateDoc(doc(fireDB, "chats", chatId), {
        messages: arrayUnion(message)
      });

      const userIDs = [currentUser.uid, user.id];
      
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(fireDB, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            const updatedChats = [...userChatsData.chats];
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              lastMessage: text.trim(),
              isSeen: id === currentUser.uid,
              updatedAt: Date.now(),
            };

            await updateDoc(userChatsRef, {
              chats: updatedChats,
            });
          }
        }
      });

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className='main-chat'>
      <div className="chat-one">
        <div className="sub-chat-one">
          <img src={user?.avatar || 'src/assets/img1.jpg'} alt="avatar" />
          <div className="">
            <h4>{user?.name || 'Unknown User'}</h4>
            <p>{user?.status || 'Offline'}</p>
          </div>
        </div>
        <div className="icon">
          <p><FaVideo /></p>
          <p><MdCall /></p>
        </div>
      </div>

      
        <div className="chatting-one">
          {chat?.messages?.map((message) => (
            <div 
              className={message.senderId === currentUser?.uid ? "message own" : "message"} 
              key={message.createdAt}
              ref={endRef}
            >
              <p>{message.text}</p>
            </div>
          ))}
        </div>

      <div className="chat-two">
        <div className="chat-input">
          <FaRegImage className="icon" />
          <FaCamera className="icon" />
          <FaMicrophone className="icon" />
          <input 
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            type="text" 
            placeholder='Type a message...' 
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()
          
            }
          />
          <div className="emoji-container">
            <BsFillEmojiSmileFill 
              className="icon" 
              onClick={() => setOpen(!open)} 
            />
            {open && (
              <div className="emoji-picker">
                <EmojiPicker onEmojiClick={handleEmoji} />
              </div>
            )}
          </div>
          <button onClick={handleSend}
           disabled={isCurrentUserBlocked || isReceiverBlocked}
           >Send</button>
        </div>
      </div>
    </div>
  )
}

export default Chat