import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDlTf4rXcc9UcAwKRyeu1-IlSKAXRkxXqY',
  appId: '1:362803203972:web:eaac6fd2a6c466d29c97d1',
  messagingSenderId: '362803203972',
  projectId: 'icebox-94f8d',
  authDomain: 'icebox-94f8d.firebaseapp.com',
  storageBucket: 'icebox-94f8d.firebasestorage.app',
  measurementId: 'G-WBPTFNM57Q',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
