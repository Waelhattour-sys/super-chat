import React, { useRef, useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyBcsNI5IYwY4HRjFMDJkTF-gllolUrHhd4",
  authDomain: "super-chat-fda7c.firebaseapp.com",
  projectId: "super-chat-fda7c",
  storageBucket: "super-chat-fda7c.appspot.com",
  messagingSenderId: "256827899454",
  appId: "1:256827899454:web:911d50999a92c1c0afdb6f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom user={user}/> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={signInWithGoogle}>
      Sign In with Google
    </button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom({ user }) {
  const messagesRef = collection(firestore, 'messages');
  console.log(messagesRef)
  const q = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages] = useCollectionData(q, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const dummy = useRef();

  const sendMessage = async (e) => {
    e.preventDefault();

    try {
      let response=await addDoc(messagesRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid: user.uid,
        photoURL: user.photoURL,
      });
      console.log(response)
      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Say something nice"
        />
        <button type="submit" disabled={!formValue}>🕊️</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { uid, text, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg'} alt="User Avatar" />
      <p>{text}</p>
    </div>
  );
}

export default App;
