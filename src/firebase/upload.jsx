import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
let upload=async(file)=>{

 
let date=new Date();
const storage = getStorage();
const storageRef = ref(storage, file.name);

const uploadTask = uploadBytesResumable(storageRef, `images/${date+file.name}`);

return new Promise((resolve, reject) => {
uploadTask.on('state_changed', 
  (snapshot) => {
   
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    
  }, 
  (error) => {
    reject("something  went wrong!"+error.code)
  }, 
  () => {

    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      resolve(downloadURL);
    });
  }
);
})
}
export default upload