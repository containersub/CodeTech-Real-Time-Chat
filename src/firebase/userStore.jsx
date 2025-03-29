import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { fireDB } from './FirebaseConfig';

export const useUserStore = create((set) => ({
 currentUser:null,
 isLoading:true,
 fetchUserInfo:async(uid)=>{
    if(!uid) return set({currentUser:null,isLoading:false});
    try{

        let docRef=doc(fireDB,"users",uid);
        let docSnap=await getDoc(docRef);

        if(docSnap.exists()){
            set({currentUser:docSnap.data(),isLoading:false});
            console.log("Document data:",docSnap.data())
        }else{
            set({currentUser:null,isLoading:false});
        }
    }catch(error){
        console.error(error);
        return set({currentUser:null,isLoading:false})
    }
 }
}))
