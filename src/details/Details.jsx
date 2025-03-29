import React, { useEffect } from 'react'
import './details.css'
import { auth, fireDB } from '../firebase/FirebaseConfig'
import { useUserStore } from '../firebase/userStore'
import { useChatStore } from '../firebase/chatStore'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'

const Details = () => {
  const { currentUser, isLoading: userLoading } = useUserStore();
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, isLoading: chatLoading } = useChatStore();

  useEffect(() => {
    if (!userLoading && !currentUser) {
      console.log("Authentication status:", auth.currentUser);
    }
  }, [currentUser, userLoading]);


  const handleBlock = async () => {
    if (!currentUser?.uid) { // Changed from .id to .uid (Firebase uses uid)
      console.error("Current user not authenticated");
      return;
    }

    if (!user?.uid) { // Changed from .id to .uid to match Firebase convention
      console.error("No chat user selected");
      return;
    }

    try {
      const userDocRef = doc(fireDB, "users", currentUser.uid); // Use uid instead of id
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked 
          ? arrayRemove(user.uid) // Use uid instead of id
          : arrayUnion(user.uid) // Use uid instead of id
      });
      
      // Toggle the local state after successful Firestore update
      changeBlock(!isReceiverBlocked);
      
    } catch (error) {
      console.error("Block operation failed:", error);
      // Add error handling UI here if needed
    }
  };

  if (userLoading || chatLoading) {
    return <div className='detail-main'>Loading user data...</div>;
  }

  if (!currentUser || !user) {
    return <div className='detail-main'>Select a chat to view details</div>;
  }

  return (
    <div className='detail-main'>
      <div className="detail-one">
        <img src='src/assets/img1.jpg'/>
        <h2>{user?.name || 'Unknown User'}</h2>
        <p>Hi friends ,What's Up</p>
      </div>
  <div className="logout">
  <button 
          className='block' 
          onClick={handleBlock}
          disabled={!currentUser || !user}
        >
          {isCurrentUserBlocked 
            ? "You are Blocked" 
            : isReceiverBlocked 
              ? "User Blocked" 
              : "Block User"}
        </button>
    <button className='logout-btn' onClick={() => {
      auth.signOut().then(() => {
        console.log("User signed out successfully.");
      }).catch((error) => {
        console.error("Error signing out: ", error);
      });
    }}>Logout</button>

  </div>
    </div>
  )
}

export default Details
