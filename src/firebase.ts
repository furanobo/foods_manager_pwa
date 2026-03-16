import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBNbdVBMmVmE7_TzmRKbfQY0CbX7Z9lssI',
  appId: '1:979449650922:web:fa52008c4e2627101bc193',
  messagingSenderId: '979449650922',
  projectId: 'foods-manager-62109',
  authDomain: 'foods-manager-62109.firebaseapp.com',
  databaseURL: 'https://foods-manager-62109-default-rtdb.firebaseio.com',
  storageBucket: 'foods-manager-62109.appspot.com',
  measurementId: 'G-VXFJK9TEW9',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
