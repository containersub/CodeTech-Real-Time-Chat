import React, { useState } from 'react';
import { fireDB } from '../firebase/FirebaseConfig';
import {  writeBatch } from 'firebase/firestore';
import './adduser.css';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore';

import { useUserStore } from '../firebase/userStore';

const Adduser = () => {
  let { currentUser } = useUserStore();

  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchName = formData.get('username').trim().toLowerCase();

    if (!searchName) {
      setErrorMsg('Please enter a name');
      setUser(null);
      return;
    }

    try {
      const usersRef = collection(fireDB, 'users');
      // Query using 'name' field with case-insensitive search
      const q = query(
        usersRef,
        where('name', '>=', searchName),
        where('name', '<=', searchName + '\uf8ff')
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        setUser({
          id: userDoc.id,
          ...userDoc.data()
        });
        setErrorMsg('');
      } else {
        setUser(null);
        setErrorMsg('User not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrorMsg('Search failed');
    }
  };

  const handleAddUser = async () => {
    if (!user?.uid || !currentUser?.uid) {
      setErrorMsg('Invalid user data');
      return;
    }
  
    setIsAdding(true);
    try {
      // 1. Create new chat document
      const chatRef = doc(collection(fireDB, 'chats'));
      await setDoc(chatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        participants: [currentUser.uid, user.uid]
      });
      console.log(user)
      console.log(currentUser)
      // 2. Prepare document references
      const currentUserDocRef = doc(fireDB, 'userchats', currentUser.uid);
      const targetUserDocRef = doc(fireDB, 'userchats', user.uid);
  
      // 3. Initialize documents if they don't exist
      const batch = writeBatch(fireDB);
      
      // Initialize current user's document
      if (!(await getDoc(currentUserDocRef)).exists()) {
        batch.set(currentUserDocRef, { chats: [] });
      }
  
      // Initialize target user's document
      if (!(await getDoc(targetUserDocRef)).exists()) {
        batch.set(targetUserDocRef, { chats: [] });
      }
  
      // 4. Add chat updates to batch
      const chatData = {
        chatId: chatRef.id,
        lastMessage: "",
        receiverId: user.uid,
        updatedAt: Date.now()
      };
  
      batch.update(currentUserDocRef, {
        chats: arrayUnion(chatData)
      });
  
      batch.update(targetUserDocRef, {
        chats: arrayUnion({
          ...chatData,
          receiverId: currentUser.uid
        })
      });
  
      // 5. Commit all changes atomically
      await batch.commit();
  
      setErrorMsg('Chat created successfully!');
      setUser(null);
    } catch (error) {
      console.error('Firestore error:', error);
      setErrorMsg(`Error: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="main-adduser">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name (e.g., vijay)"
          name="username"
          autoComplete="off"
        />
        <button type="submit">Search</button>
      </form>

      {errorMsg && (
        <div className={`alert ${errorMsg.includes('success') ? 'success' : 'error'}`}>
          {errorMsg}
        </div>
      )}

      {user && (
        <div className="user-card">
          <div className="user-info">
            <h3>{user.name}</h3>
          </div>
          <button
            onClick={handleAddUser}
            disabled={isAdding}
            className={isAdding ? 'loading' : ''}
          >
            {isAdding ? 'Adding...' : 'Add to Chat'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Adduser;
