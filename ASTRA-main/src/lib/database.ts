
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "./firebase";
import { User as FirebaseUser } from 'firebase/auth';

// --- USER MANAGEMENT --- //

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: any; // Using 'any' for serverTimestamp flexibility
}

// Function to add or update user data in Firestore
export const addUserToDatabase = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userData: Partial<User> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
    };

    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
        userData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, userData, { merge: true });
};


// --- CONVERSATION MANAGEMENT --- //

// Function to create a new conversation in Firestore
export const createConversation = async (title: string, firstMessage: { content: string; fileUrl?: string | null; fileName?: string | null }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await addUserToDatabase(user); // Ensure user exists in DB

    const docRef = await addDoc(collection(db, "conversations"), {
        userId: user.uid,
        title: title,
        createdAt: serverTimestamp(),
        messages: [
            {
                sender: 'user',
                content: firstMessage.content,
                fileUrl: firstMessage.fileUrl || null,
                fileName: firstMessage.fileName || null,
                timestamp: serverTimestamp()
            },
        ]
    });
    return docRef.id;
};

// Function to add a message to a conversation
export const addMessageToConversation = async (conversationId: string, sender: 'user' | 'ai', content: string, fileUrl?: string | null, fileName?: string | null) => {
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
        const messages = conversationSnap.data().messages || [];
        const newMessage = {
            sender,
            content,
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            timestamp: serverTimestamp()
        };
        await updateDoc(conversationRef, {
            messages: [...messages, newMessage]
        });
    } else {
        console.error("Conversation not found");
    }
};

// Function to get all conversations for a user
export const getUserConversations = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const q = query(collection(db, "conversations"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const conversations: any[] = [];
    querySnapshot.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() });
    });
    return conversations;
};

// Function to get a specific conversation
export const getConversation = async (conversationId: string) => {
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
        return { id: conversationSnap.id, ...conversationSnap.data() };
    } else {
        return null;
    }
};

// Function to upload a file and get its URL
export const uploadFile = async (file: File) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await addUserToDatabase(user); // Ensure user exists in DB

    const storageRef = ref(storage, `users/${user.uid}/uploads/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};
