import React, { useEffect, useState } from 'react';
import './list.css';
import { HiDotsHorizontal } from 'react-icons/hi';
import { FaVideo, FaRegEdit } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import img1 from '../assets/img1.jpg';
import Adduser from '../adduser/Adduser';
import { useUserStore } from '../firebase/userStore';
import { doc, onSnapshot, getDoc} from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';
import { useChatStore } from '../firebase/chatStore';

const List = () => {
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const { changeChat } = useChatStore();
  useEffect(() => {
    if (currentUser?.uid) { // Changed from currentUser.id to uid
      const unSub = onSnapshot(
        doc(fireDB, 'userchats', currentUser.uid), // Use UID here
        async (docSnapshot) => {
          try {
            if (docSnapshot.exists()) {
              const chatsData = docSnapshot.data().chats || [];
              
              const enrichedChats = await Promise.all(
                chatsData.map(async (chat) => {
                  try {
                    const userDoc = await getDoc(doc(fireDB, 'users', chat.receiverId));
                    return {
                      ...chat,
                      user: userDoc.exists() ? userDoc.data() : null
                    };
                  } catch (error) {
                    console.error('Error fetching user:', error);
                    return { ...chat, user: null };
                  }
                })
              );

              setChats(enrichedChats.sort((a, b) => b.updatedAt - a.updatedAt));
            } else {
              setChats([]);
            }
          } catch (error) {
            console.error('Error fetching chats:', error);
          } finally {
            setLoading(false);
          }
        }
      );

      return () => unSub();
    }
  }, [currentUser?.uid]); // Add uid as dependency

  let handleSelect=async(chat)=>{

    changeChat(chat.chatId, chat.user);
  }


  return (
    <div className="main">
      <div className="user-info">
        <img src={img1} alt="user" />
        <h4>{currentUser ? currentUser.name : 'Guest'}</h4>
        <p><HiDotsHorizontal /></p>
        <p><FaVideo /></p>
        <p><FaRegEdit /></p>
      </div>
      <div className="src">
        <div className="">
          <p><FiSearch /></p>
          <input type="text" placeholder="Search" />
        </div>
        <p className="add" onClick={() => setAddMode((prev) => !prev)}>
          {addMode ? '-' : '+'}
        </p>
      </div>
      
      {loading ? (
        <div className="loading">Loading chats...</div>
      ) : (
        <div className="dash-map">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div className="dash-pro one" key={chat.chatId} onClick={()=>handleSelect(chat)}>
                <img src={chat.user?.avatar || img1} alt="chat" />
                <div className="chat-info">
                  <h4>{chat.user?.name || 'Unknown User'}</h4>
                  <p>{chat.lastMessage || 'No messages yet'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-chats">Start a new chat by clicking the + button</p>
          )}
        </div>
      )}

      {addMode && <Adduser onClose={() => setAddMode(false)} />}
    </div>
  );
};

export default List;