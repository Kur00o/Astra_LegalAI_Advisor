
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Bot, User, Send, Paperclip, X, File as FileIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { legalChatbot, LegalChatbotInput } from '@/ai/flows/legal-chatbot';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  createConversation,
  addMessageToConversation,
  uploadFile,
  getConversation
} from '@/lib/database';
import { auth } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface Message {
  role: 'user' | 'assistant';
  content: string;
  filePreview?: string; // For temporary local preview
  fileUrl?: string; // For permanent storage
  fileName?: string;
}

interface Jurisdiction {
  code: string;
  name: string;
}

export default function LegalChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conversationIdFromUrl = searchParams.get('id');
    if (auth.currentUser && conversationIdFromUrl) {
      loadConversation(conversationIdFromUrl);
    } else {
      setMessages([]);
      setConversationId(null);
    }

    const storedJurisdiction = localStorage.getItem('jurisdiction');
    if (storedJurisdiction) {
      setJurisdiction(JSON.parse(storedJurisdiction));
    }
  }, [searchParams, router]);
  
  const loadConversation = async (id: string) => {
      setIsLoading(true);
      const conversation = await getConversation(id);
      if (conversation && conversation.messages) {
        setConversationId(conversation.id);
        const formattedMessages = conversation.messages.map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
        }));
        setMessages(formattedMessages);
      } else {
        router.push('/dashboard/legal-chatbot');
      }
      setIsLoading(false);
      scrollToBottom();
    };


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      const scrollableViewport = (scrollAreaRef.current?.firstChild as HTMLElement)?.firstChild as HTMLElement;
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }, 100);
  };
  
  const handleAttachmentClick = () => {
    if (!auth.currentUser) {
      setShowLoginPrompt(true);
    } else {
      open();
    }
  };

  const handleSendMessage = async () => {
    if (!jurisdiction || (!input.trim() && !file)) return;

    setIsLoading(true);
    const query = input;
    const tempFile = file;
    const tempFilePreview = filePreview;

    setInput('');
    setFile(null);
    setFilePreview(null);
    
     if (!auth.currentUser) {
      const userMessageForUI: Message = { role: 'user', content: query };
      setMessages(prev => [...prev, userMessageForUI]);
      scrollToBottom();

      const aiPayload: LegalChatbotInput = {
        query,
        history: messages,
        jurisdiction: jurisdiction.name,
      };
      const result = await legalChatbot(aiPayload);
      const aiMessage: Message = { role: 'assistant', content: result.response };
      setMessages(prev => [...prev, aiMessage]);

      setIsLoading(false);
      scrollToBottom();
      return;
    }

    const userMessageForUI: Message = {
      role: 'user',
      content: query,
      ...(tempFilePreview && { filePreview: tempFilePreview, fileName: tempFile?.name || "Uploaded File" }),
    };
    setMessages(prev => [...prev, userMessageForUI]);
    scrollToBottom();

    let currentConversationId = conversationId;
    
    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;

      if (tempFile) {
        fileUrl = await uploadFile(tempFile);
        fileName = tempFile.name;
      }
      
      if (!currentConversationId) {
        const newConvId = await createConversation(
          query.substring(0, 30) || 'New Conversation',
          { content: query, fileUrl, fileName }
        );
        currentConversationId = newConvId;
        setConversationId(newConvId);
        router.push(`/dashboard/legal-chatbot?id=${newConvId}`, { scroll: false });
      } else {
        await addMessageToConversation(currentConversationId, 'user', query, fileUrl, fileName);
      }
      
      const aiPayload: LegalChatbotInput = {
        query,
        history: messages, 
        jurisdiction: jurisdiction.name,
        ...(tempFilePreview && { documentDataUri: tempFilePreview }),
      };

      const result = await legalChatbot(aiPayload);
      await addMessageToConversation(currentConversationId, 'ai', result.response);

      const aiMessage: Message = { role: 'assistant', content: result.response };
      setMessages(prev => [...prev, aiMessage]);

    } catch (e) {
      console.error("Error processing message:", e);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };
  
  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  }

  return (
    <main className="flex flex-col h-full bg-secondary p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg flex flex-col h-full" {...getRootProps()}>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <Bot className="h-6 w-6" />
            Legal Question Chatbot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                  <div className={`p-3 rounded-lg max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {(message.filePreview || message.fileUrl) && (
                        <div className="mb-2 p-2 border rounded-md bg-background/20">
                            {(message.filePreview || message.fileUrl || "").startsWith('data:image') || (message.fileUrl && (message.fileName?.endsWith('.png') || message.fileName?.endsWith('.jpg') || message.fileName?.endsWith('.jpeg')))? (
                                <Image src={message.filePreview || message.fileUrl!} alt={message.fileName || "Uploaded image"} width={200} height={150} className="rounded-md object-cover" />
                            ) : (
                                <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                                    <FileIcon className="h-6 w-6 flex-shrink-0" />
                                    <span className="text-sm font-medium">{message.fileName}</span>
                                </a>
                            )}
                        </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
              {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                    <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                    <div className="p-3 rounded-lg bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 pt-4 border-t">
             {filePreview && (
                <div className="relative p-2 border rounded-lg flex items-center gap-3 mb-2">
                    {file?.type.startsWith('image/') ? (
                        <Image src={filePreview} alt="Preview" width={40} height={40} className="rounded-md object-cover"/>
                    ) : (
                        <FileIcon className="h-6 w-6 text-muted-foreground"/>
                    )}
                    <div className="text-sm flex-1">
                        <p className="font-medium truncate">{file?.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeFile}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <div className="relative">
              <input {...getInputProps()} />
              <Textarea
                placeholder="Ask a legal question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-24 text-base"
                rows={2}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <Button variant="ghost" size="icon" onClick={handleAttachmentClick}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isLoading || (!input.trim() && !file) || !jurisdiction}
                >
                    <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
                You need to be logged in to upload and analyze documents. Please log in to continue.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>Login</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
     </AlertDialog>
    </main>
  );
}
