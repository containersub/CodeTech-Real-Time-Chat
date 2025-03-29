
import { create } from 'zustand'


import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
 chatId:null,
 user:true,
 isCurrentUserBlocked:false,
 isReceiverBlocked:false,
 changeChat:(chatId,user)=>{
    let currentUser=useUserStore.getState().currentUser;
    //CURRENT USER BLOCK
    if(user.blocked.includes(currentUser.id)){
        return set({
            chatId,
            user:null,
            isCurrentUserBlocked:true,
            isReceiverBlocked:false,
        })
    }

    //RECEIVER BLOCK
    else if(currentUser.blocked.includes(user.id)){
        return set({
            chatId,
            user:user,
            isCurrentUserBlocked:false,
            isReceiverBlocked:true,
        })
    }else{
    return set({
        chatId,
        user,
        isCurrentUserBlocked:false,
        isReceiverBlocked:false,
    })
    }
 },
 changeBlock:()=>{
    set((state)=>({...state,isReceiverBlocked: !state.isReceiverBlocked}));
 }

}))
