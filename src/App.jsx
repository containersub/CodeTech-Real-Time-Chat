
import { useEffect } from 'react';
import './App.css';
import Chat from './chat/Chat';
import Details from './details/Details';
import List from './list/List';
import Login from './registration/Login';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/FirebaseConfig';
import { useUserStore } from './firebase/userStore';
import { useChatStore } from './firebase/chatStore';


const App = () => {
  let {isLoading,currentUser,fetchUserInfo}=useUserStore()
  let{chatId}=useChatStore()

useEffect(()=>{
  let unSub = onAuthStateChanged(auth,(user)=>{
    fetchUserInfo(user?.uid);
    console.log(user.uid);
  });
  return ()=>{
    unSub();
  }
},[fetchUserInfo])
console.log(currentUser)
   

  if (isLoading) return <div className="load">Loading....</div>
  return (
    <div className='container'>
      {currentUser ? (
        <>
          <List/>
          {chatId &&<Chat/>} 
          {chatId &&<Details/>}
        </>
      ):(
        <>
        <Login/>
        </>
      )}
    </div>
  );
}

export default App;
