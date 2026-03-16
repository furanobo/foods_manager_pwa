import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

export async function uploadImage(uid: string, file: File): Promise<string> {
  const filename = `${Date.now()}_${file.name}`
  const storageRef = ref(storage, `users/${uid}/images/${filename}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return url
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
  } catch (err) {
    // Image may not exist in storage (external URL), ignore errors
    console.warn('Failed to delete image:', err)
  }
}
