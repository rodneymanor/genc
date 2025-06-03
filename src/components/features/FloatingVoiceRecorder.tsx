'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  X, 
  Save, 
  Loader2, 
  Lightbulb,
  Play,
  Pause,
  Square,
  CheckCircle
} from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { saveScript } from '@/lib/firestoreService';
// import { toast } from 'sonner'; // removed - will use console or alert for now

interface VoiceRecording {
  blob: Blob;
  url: string;
  duration: number;
}

interface VideoIdea {
  title: string;
  description: string;
  hook: string;
  tags: string[];
}

const FloatingVoiceRecorder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recording, setRecording] = useState<VoiceRecording | null>(null);
  const [transcript, setTranscript] = useState('');
  const [videoIdeas, setVideoIdeas] = useState<VideoIdea[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [savedIdeas, setSavedIdeas] = useState<Set<number>>(new Set()); // Track saved idea indices
  const [savingIdeas, setSavingIdeas] = useState<Set<number>>(new Set()); // Track currently saving ideas
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const authContext = useContext(AuthContext);

  // Helper function to show notifications
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can replace this with your preferred toast library
  };

  // Cleanup function
  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    audioChunksRef.current = [];
    setRecordingTime(0);
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecording({
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime
        });
        
        // Automatically start transcription after recording is created
        setTimeout(() => {
          transcribeAudioAutomatically(audioBlob);
        }, 100); // Small delay to ensure state is updated
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      showNotification('Failed to access microphone. Please check permissions.', 'error');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    
    // Set transcribing state immediately since we'll auto-transcribe
    setIsTranscribing(true);
  };

  // Pause/Resume recording
  const togglePauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  // Auto-transcribe function (called automatically after stopping)
  const transcribeAudioAutomatically = async (audioBlob: Blob) => {
    try {
      // Send audio to transcription API
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch('/api/transcribe', { 
        method: 'POST', 
        body: formData 
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTranscript(result.transcript);
        generateVideoIdeas(result.transcript);
      } else {
        throw new Error(result.error || 'Transcription failed');
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      showNotification('Failed to transcribe audio', 'error');
      
      // Fallback to placeholder for demo purposes
      const mockTranscript = "This is a placeholder transcript. In production, this would be the actual transcribed audio content from your recording.";
      setTranscript(mockTranscript);
      generateVideoIdeas(mockTranscript);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Manual transcribe function (for re-transcription if needed)
  const transcribeAudio = async () => {
    if (!recording) return;
    
    setIsTranscribing(true);
    await transcribeAudioAutomatically(recording.blob);
  };

  // Generate video ideas from transcript
  const generateVideoIdeas = async (transcriptText: string) => {
    try {
      const response = await fetch('/api/generate-video-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcriptText }),
      });

      const result = await response.json();

      if (result.success) {
        setVideoIdeas(result.videoIdeas);
      } else {
        throw new Error(result.error || 'Failed to generate video ideas');
      }
    } catch (error) {
      console.error('Error generating video ideas:', error);
      
      // Fallback to mock data
      const mockIdeas: VideoIdea[] = [
        {
          title: "5 Key Insights from Your Voice Note",
          description: "Transform your thoughts into actionable content",
          hook: "You just shared something powerful...",
          tags: ["insights", "productivity", "personal-development"]
        },
        {
          title: "Behind the Scenes: My Thought Process",
          description: "Raw, unfiltered thoughts turned into valuable content",
          hook: "Ever wonder how ideas really form?",
          tags: ["behind-the-scenes", "creativity", "process"]
        },
        {
          title: "Lessons Learned: A Voice Note Reflection",
          description: "Converting spontaneous thoughts into teaching moments",
          hook: "Sometimes the best content comes from...",
          tags: ["lessons", "reflection", "storytelling"]
        }
      ];
      setVideoIdeas(mockIdeas);
    }
  };

  // Save to library
  const saveToLibrary = async (idea: VideoIdea, index: number) => {
    if (!authContext?.userProfile) {
      showNotification('Please log in to save to library', 'error');
      return;
    }

    // Mark this idea as currently saving
    setSavingIdeas(prev => new Set([...prev, index]));

    try {
      const scriptContent = {
        title: idea.title,
        videoIdea: idea.description, // Use description as the video idea
        finalScriptText: transcript, // Use transcript as the script text
        // Optional fields
        selectedScriptItems: {
          voiceNote: {
            hook: idea.hook,
            tags: idea.tags,
            transcript: transcript
          }
        }
      };

      await saveScript(authContext.userProfile.uid, null, scriptContent);
      showNotification('Saved to library successfully!');
      
      // Mark as saved and remove from saving state
      setSavedIdeas(prev => new Set([...prev, index]));
      setSavingIdeas(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });

      // After a delay, remove the saved idea from the list
      setTimeout(() => {
        setVideoIdeas(prev => prev.filter((_, i) => i !== index));
        setSavedIdeas(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000); // Show "saved" popup for 2 seconds

    } catch (error) {
      console.error('Error saving to library:', error);
      showNotification('Failed to save to library', 'error');
      
      // Remove from saving state on error
      setSavingIdeas(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // Reset everything
  const resetRecorder = () => {
    cleanup();
    setRecording(null);
    setTranscript('');
    setVideoIdeas([]);
    setSavedIdeas(new Set());
    setSavingIdeas(new Set());
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  };

  // Close drawer
  const closeDrawer = () => {
    setIsOpen(false);
    if (isRecording) {
      stopRecording();
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-20px);
            opacity: 0;
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .slide-up-animation {
          animation: slideUp 0.3s ease-out forwards;
        }
        
        .slide-down-animation {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
      
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        size="lg"
      >
        <Mic className="h-6 w-6" />
      </Button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={closeDrawer}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-96 bg-background border-l shadow-xl z-50 transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Voice Recorder</h2>
                <Button variant="ghost" size="sm" onClick={closeDrawer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  {/* Recording Controls */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Recording</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Timer */}
                      <div className="text-center">
                        <div className="text-2xl font-mono">
                          {formatTime(recordingTime)}
                        </div>
                        {isRecording && (
                          <Badge variant="destructive" className="mt-1">
                            {isPaused ? 'Paused' : 'Recording'}
                          </Badge>
                        )}
                        {isTranscribing && !isRecording && (
                          <Badge variant="secondary" className="mt-1">
                            Transcribing Audio
                          </Badge>
                        )}
                        {recording && !isTranscribing && !isRecording && (
                          <Badge variant="outline" className="mt-1">
                            Ready
                          </Badge>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex justify-center gap-2">
                        {!isRecording && !recording && !isTranscribing ? (
                          <Button onClick={startRecording} className="gap-2">
                            <Mic className="h-4 w-4" />
                            Start Recording
                          </Button>
                        ) : isRecording ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={togglePauseRecording}
                            >
                              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={stopRecording}
                            >
                              <Square className="h-4 w-4" />
                              Stop & Transcribe
                            </Button>
                          </>
                        ) : isTranscribing ? (
                          <div className="flex flex-col items-center gap-2">
                            <Button disabled className="gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Transcribing...
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Converting speech to text
                            </p>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={resetRecorder}
                            >
                              Record Again
                            </Button>
                            {transcript && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={transcribeAudio}
                                disabled={isTranscribing}
                              >
                                <Loader2 className={`h-4 w-4 ${isTranscribing ? 'animate-spin' : 'hidden'}`} />
                                Re-transcribe
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Audio Playback */}
                      {recording && (
                        <div className="space-y-2">
                          <audio 
                            controls 
                            src={recording.url} 
                            className="w-full"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Transcript */}
                  {transcript && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Transcript</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          value={transcript}
                          onChange={(e) => setTranscript(e.target.value)}
                          placeholder="Your transcript will appear here..."
                          className="min-h-[100px]"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Video Ideas */}
                  {videoIdeas.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Video Ideas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {videoIdeas.map((idea, index) => {
                          const isSaved = savedIdeas.has(index);
                          const isSaving = savingIdeas.has(index);
                          
                          if (isSaved) {
                            // Show saved popup
                            return (
                              <div 
                                key={`saved-${index}`}
                                className="p-3 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 flex items-center justify-center transition-all duration-500 ease-out animate-pulse"
                              >
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-medium text-sm">Saved to Library!</span>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div 
                              key={index} 
                              className="p-3 border rounded-lg space-y-2 transition-all duration-300 ease-in-out transform hover:shadow-md"
                              style={{
                                transform: savedIdeas.size > 0 ? 'translateY(0)' : 'translateY(0)',
                                opacity: isSaving ? 0.7 : 1
                              }}
                            >
                              <div>
                                <h4 className="font-medium text-sm">{idea.title}</h4>
                                <p className="text-xs text-muted-foreground">{idea.description}</p>
                              </div>
                              <div>
                                <p className="text-xs"><strong>Hook:</strong> {idea.hook}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex gap-1 flex-wrap">
                                  {idea.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <Button 
                                  size="sm" 
                                  variant={isSaving ? "secondary" : "outline"}
                                  onClick={() => saveToLibrary(idea, index)}
                                  disabled={isSaving || savingIdeas.size > 0}
                                  className="transition-all duration-200"
                                >
                                  {isSaving ? (
                                    <>
                                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-3 w-3 mr-1" />
                                      Save
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        
                        {videoIdeas.length === 0 && savedIdeas.size > 0 && (
                          <div className="text-center py-6">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">All ideas saved to library!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingVoiceRecorder; 