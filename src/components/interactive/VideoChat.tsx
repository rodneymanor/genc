'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User, Loader2, AlertTriangle, Mic } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoPipelineStatus, { type StepStatus } from './VideoPipelineStatus';

const VideoChat = () => {
  const {
    selectedVideo,
    isProcessingUrl,
    processingUrlError,
    setProcessingUrlError,
    isTranscribing,
    transcriptionProgress,
    transcriptText,
    transcriptionError,
    setTranscriptionError,
  } = useAppContext();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [rewriteStatusState, setRewriteStatusState] = useState<StepStatus>('pending');
  const [isRewriting, setIsRewriting] = useState(false);
  const [showTranscriptView, setShowTranscriptView] = useState(false);

  const memoizedInitialMessages = useMemo(() => {
    if (!selectedVideo) return [];
    return [
      {
        id: 'welcome-message-' + selectedVideo.id,
        role: 'assistant' as const,
        content: `I'm ready to help you analyze "${selectedVideo.title || 'this video'}". What would you like to know?`,
        createdAt: new Date(),
      }
    ];
  }, [selectedVideo?.id, selectedVideo?.title]);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error: chatError, setMessages, append } = useChat({
    api: '/api/chat',
    initialMessages: memoizedInitialMessages,
    body: {
      videoId: selectedVideo?.id,
    },
    onFinish: (message) => {
      scrollToBottom();
    }
  });

  // Reset rewrite status when the selected video changes or becomes null
  useEffect(() => {
    setRewriteStatusState('pending');
    setIsRewriting(false); // Also reset rewriting flag
    setShowTranscriptView(false); // Hide transcript for new video
  }, [selectedVideo]);

  const handleRewriteScript = useCallback(async () => {
    if (!transcriptText || !selectedVideo || isRewriting) return;
    
    console.log("[VideoChat] Starting script rewrite for:", selectedVideo.title);
    setIsRewriting(true);
    setRewriteStatusState('inProgress');
    
    let assistantMessageId = `assistant-${Date.now()}`; // Ensure unique ID format if needed
    let currentAssistantResponse = "";

    try {
      await append({ // Added await
        id: `user-${Date.now()}`,
        role: 'user',
        content: 'Rewrite this script as a short-form video script (60 seconds or less).'
      });
      
      // Initialize assistant message for streaming
      await append({ // Added await
          id: assistantMessageId,
          role: 'assistant',
          content: '' // Start with empty content, will be updated by stream
      });

      const response = await fetch('/api/rewrite-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: transcriptText,
          videoMetadata: { title: selectedVideo.title }
        }),
      });
      
      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response or empty body" }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last partial line in buffer

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const jsonData = line.substring(2);
              const chunk = JSON.parse(jsonData);
              if (typeof chunk === 'string') {
                currentAssistantResponse += chunk;
                setMessages(prevMessages => 
                  prevMessages.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: currentAssistantResponse } 
                      : msg
                  )
                );
              } else {
                // If chunk is not a string, it's unexpected data for this stream part
                console.warn("[VideoChat] Stream chunk is not a string:", chunk);
              }
            } catch (e) {
              console.warn("[VideoChat] Failed to parse stream line JSON:", line, e);
              // Do not throw here, let it continue to see if other lines are valid
              // The final check on currentAssistantResponse will determine overall success
            }
          }
        }
      }
      // Process any remaining buffer content
      if (buffer.startsWith('0:')) {
        try {
          const jsonData = buffer.substring(2);
          const chunk = JSON.parse(jsonData);
          if (typeof chunk === 'string') {
            currentAssistantResponse += chunk;
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: currentAssistantResponse } 
                  : msg
              )
            );
          } else {
             console.warn("[VideoChat] Final stream buffer chunk is not a string:", chunk);
          }
        } catch (e) {
          console.warn("[VideoChat] Failed to parse final stream buffer JSON:", buffer, e);
        }
      }

      if (!currentAssistantResponse.trim()) {
        console.warn("[VideoChat] Rewritten script content is empty after stream processing.");
        // It's possible the API successfully returned an empty stream if the script was trivial
        // or if OpenAI decided no rewrite was possible/needed and sent nothing.
        // For now, let's reflect this as potentially valid but empty, or throw error.
        // Throwing an error to make it explicit in UI:
        throw new Error("The rewritten script is empty. OpenAI might have returned no content.");
      }

      // Final update with the full content.
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: currentAssistantResponse.trim() } 
            : msg
        )
      );
      
      setRewriteStatusState('complete');
      console.log("[VideoChat] Script successfully rewritten as short-form content for:", selectedVideo.title);
    } catch (error: any) {
      console.error("[VideoChat] Error rewriting script:", error);
      setRewriteStatusState('error');
      
      // Update the specific assistant message with the error, or add a new error message.
      setMessages(prevMessages => {
        const existingMessageIndex = prevMessages.findIndex(msg => msg.id === assistantMessageId);
        if (existingMessageIndex !== -1) {
          // Update existing message
          return prevMessages.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: `Error rewriting script: ${error.message || 'An unexpected error occurred.'}` } 
              : msg
          );
        } else {
          // If the assistant message was never properly added or ID is wrong, add a new error message.
          // This case should be rare given the flow.
          return [
            ...prevMessages,
            {
              id: assistantMessageId, // Or a new error-specific ID like `error-${Date.now()}`
              role: 'assistant',
              content: `Error rewriting script: ${error.message || 'An unexpected error occurred.'}`,
              createdAt: new Date()
            }
          ];
        }
      });
    } finally {
      setIsRewriting(false);
      scrollToBottom();
    }
  }, [transcriptText, selectedVideo, append, isRewriting, setMessages]);

  // Effect for automatic script rewrite
  useEffect(() => {
    if (transcriptText && !transcriptionError && selectedVideo && !isRewriting && rewriteStatusState === 'pending') {
      console.log("[VideoChat] Conditions met for automatic script rewrite, calling handleRewriteScript.");
      handleRewriteScript();
    }
  }, [transcriptText, transcriptionError, selectedVideo, isRewriting, rewriteStatusState, handleRewriteScript]);

  useEffect(() => {
    if (transcriptionError) {
      if (!selectedVideo || (selectedVideo && messages.length === 0)) {
        setTranscriptionError(null); 
      }
    }
  }, [selectedVideo, messages, transcriptionError, setTranscriptionError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (processingUrlError) {
    return (
      <div className="flex flex-col h-full p-4 items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold text-destructive">Error Processing URL</p>
        <p className="text-sm text-muted-foreground mb-4">{processingUrlError}</p>
        <Button onClick={() => { 
          setProcessingUrlError(null); 
          // Potentially reset selectedVideo here via useAppContext if that's the desired UX
        }} variant="outline">
            Try another URL
        </Button>
      </div>
    );
  }
  
  let determinedVideoFetchedStatus: StepStatus = 'pending';
  if (processingUrlError) {
    determinedVideoFetchedStatus = 'error';
  } else if (isProcessingUrl && !selectedVideo) {
    determinedVideoFetchedStatus = 'inProgress';
  } else if (selectedVideo) {
    determinedVideoFetchedStatus = 'complete';
  }

  let determinedTranscriptionStatus: StepStatus = 'pending';
  if (transcriptionError) {
    determinedTranscriptionStatus = 'error';
  } else if (transcriptText) {
    determinedTranscriptionStatus = 'complete';
  } else if (isTranscribing || transcriptionProgress.downloading || transcriptionProgress.transcribing) {
    determinedTranscriptionStatus = 'inProgress';
  } else if (selectedVideo && !transcriptText) { // Explicitly pending if video selected but no transcript yet
    determinedTranscriptionStatus = 'pending';
  }

  return (
    <div className="flex flex-col h-full p-4 border rounded-lg shadow-sm bg-background">
      <VideoPipelineStatus 
          videoFetchedStatus={determinedVideoFetchedStatus}
          videoFetchErrorMsg={determinedVideoFetchedStatus === 'error' ? processingUrlError || undefined : undefined}
          transcriptionStatus={determinedTranscriptionStatus}
          transcriptionErrorMsg={transcriptionError || undefined}
          rewriteScriptStatus={rewriteStatusState}
          rewriteScriptErrorMsg={rewriteStatusState === 'error' ? "Failed to rewrite script" : undefined}
      />

      {transcriptText && !transcriptionError && (
        <div className="flex justify-start py-2 mt-2 border-t border-b mb-2">
          <Button
            onClick={() => setShowTranscriptView(!showTranscriptView)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {showTranscriptView ? 'Hide Transcript' : 'Show Transcript'}
          </Button>
        </div>
      )}

      {showTranscriptView && transcriptText && !transcriptionError && (
        <Card className="mb-4 mt-0">
            <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center"><Mic className="mr-2 h-4 w-4"/> Video Transcript</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <ScrollArea className="h-[100px] text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border">
                    {transcriptText}
                </ScrollArea>
            </CardContent>
        </Card>
      )}

      {!selectedVideo && !isProcessingUrl && !processingUrlError && (
        <div className="flex flex-col flex-grow items-center justify-center text-center text-muted-foreground">
            <Bot size={48} className="mb-4 mt-8 opacity-50"/>
            <p className="text-lg font-semibold">Video Assistant Ready</p>
            <p className="text-sm">Submit a video URL to begin analysis and chat.</p>
        </div>
      )}
      
      {(selectedVideo || (isProcessingUrl && !processingUrlError)) && (
        <>
          <h3 className="text-lg font-semibold my-2 text-foreground flex items-center">
            <Bot size={20} className="mr-2" /> 
            {selectedVideo ? `Chat about: ${selectedVideo.title}` : (isProcessingUrl ? 'Processing Video...' : 'No video selected')}
          </h3>
          
          <div className="flex-grow mb-4 pr-1">
            <ScrollArea className="h-[calc(100%-0px)] pr-3">
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                    {m.role === 'assistant' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot size={18}/></AvatarFallback>
                      </Avatar>
                    )}
                    <Card 
                      className={`max-w-[85%] text-sm ${
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-lg'
                          : 'bg-muted text-muted-foreground rounded-lg'
                      }`}
                    >
                      <CardContent className="p-3">
                        <span className="whitespace-pre-wrap">{m.content}</span>
                        {m.createdAt && (
                          <div className={`text-xs opacity-70 mt-1.5 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {m.role === 'user' && (
                      <Avatar className="h-8 w-8">
                         <AvatarFallback><User size={18}/></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && messages.length > 0 && messages[messages.length -1]?.role === 'user' && !isRewriting && (
                   <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot size={18}/></AvatarFallback>
                      </Avatar>
                      <Card className="max-w-[75%] bg-muted text-muted-foreground rounded-lg">
                          <CardContent className="p-3 text-sm">
                              Thinking...
                          </CardContent>
                      </Card>
                  </div>
                )}
                {isRewriting && rewriteStatusState === 'inProgress' && (
                    <div className="flex items-start space-x-3 py-2">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot size={18}/></AvatarFallback>
                        </Avatar>
                        <Card className="max-w-[75%] bg-muted text-muted-foreground rounded-lg">
                            <CardContent className="p-3 text-sm flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Rewriting script...
                            </CardContent>
                        </Card>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {chatError && (
            <div className="mb-2 p-3 bg-destructive/15 text-destructive border border-destructive/30 rounded-lg text-sm">
              <p>Chat Error: {chatError.message || 'Could not connect to assistant.'}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center space-x-2 pt-4 border-t">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={isLoading || isRewriting ? "AI is working..." : (isTranscribing || transcriptionProgress.downloading || transcriptionProgress.transcribing || isProcessingUrl ? "Processing video..." : "Ask about the video...")}
              disabled={isLoading || isTranscribing || transcriptionProgress.downloading || transcriptionProgress.transcribing || isProcessingUrl || isRewriting}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || input.trim() === "" || isTranscribing || transcriptionProgress.downloading || transcriptionProgress.transcribing || isProcessingUrl || isRewriting}>
              {isLoading || isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default VideoChat; 