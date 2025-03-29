import React, { useState } from 'react';
import './login.css';
import { ToastContainer, toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, fireDB } from '../firebase/FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';


const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  let [name, setName] = useState('');
  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');
  let [emailsign, setEmailsign] = useState('');
  let [passwordsign, setPasswordsign] = useState('');

  let login=async(e)=>{
    e.preventDefault();
    try{
      let log=await signInWithEmailAndPassword(auth, emailsign,passwordsign)
      console.log("Login Successfully", log);
      toast.success("Login Successfully");
    }catch(error){
      console.log("error",error);
      toast.error("Error");
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Create user with email and password
      let res = await createUserWithEmailAndPassword(auth, email, password);
      
      
      // You can also access the user ID and other details from the response
      const userId = res.user.uid;
      console.log("User ID:", userId);
      await setDoc(doc(fireDB,"users",res.user.uid),{
        name,
        email,
        uid:res.user.uid,
        blocked:[]
      })
      await setDoc(doc(fireDB,"userchats",res.user.uid),{
       chats:[],
      })
      toast.success("Account Created Successfully")
      // Proceed with additional logic, such as saving user data to Firestore
    } catch (error) {
      console.error("Error creating user:", error.message);
      toast.error("Error: " + error.message);
    }
  };


  return (
    <div className='main-login'>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="login">
        <form onSubmit={login}>
          <h2>Welcome</h2>
          <p>Sign in to get Started</p>
          <label>Email Address</label>
          <input type='text' name='email' placeholder='Enter Email' required value={emailsign} onChange={(e) => setEmailsign(e.target.value)}  />
          <label>Password</label>
          <input type='password' name='password' placeholder='Enter Password' value={passwordsign} onChange={(e) => setPasswordsign(e.target.value)} />
          <button type='submit'>Login</button>
        </form>
      </div>
      <div className="signup">
        <form onSubmit={handleRegister}>
          <h2>Welcome</h2>
          <p>Sign up to get explored</p>
          <label htmlFor='file' className='file'>
            <img src={avatar.url || "src/assets/img1.jpg"} alt='' />
            Upload an Image
          </label>
          <input type="file" id='file' style={{ display: "none" }} onChange={handleAvatar} />
          <label>Full Name</label>
          <input type='text' name='name' placeholder='Enter Full Name' value={name} onChange={(e) => setName(e.target.value)} />
          <label>Email Address</label>
          <input type='text' name='email' placeholder='Enter Email' value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Password</label>
          <input type='password' name='password' placeholder='Enter Password ' value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type='submit'>Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
