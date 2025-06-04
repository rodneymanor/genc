'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause, Square, Trash2, Download, Volume2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface AudioRecordingColumnProps {
  className?: string;
}

const AudioRecordingColumn: React.FC<AudioRecordingColumnProps> = ({
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);

  // Mock recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Add the recording to the list
    const newRecording = {
      id: Date.now(),
      duration: recordingTime,
      timestamp: new Date(),
      name: `Recording ${recordings.length + 1}`
    };
    setRecordings(prev => [newRecording, ...prev]);
    setRecordingTime(0);
  };

  const handleDeleteRecording = (id: number) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          Audio Recording
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Record your voice for script generation
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* Recording Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recording Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recording Visualizer */}
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-500/20 border-2 border-red-500 animate-pulse' 
                    : 'bg-primary/10 border-2 border-primary/20'
                }`}>
                  {isRecording ? (
                    <MicOff className="w-8 h-8 text-red-500" />
                  ) : (
                    <Mic className="w-8 h-8 text-primary" />
                  )}
                </div>
                
                {/* Recording Timer */}
                <div className="text-2xl font-mono font-bold text-foreground mb-2">
                  {formatTime(recordingTime)}
                </div>
                
                {/* Recording Status */}
                <p className="text-sm text-muted-foreground mb-4">
                  {isRecording ? 'Recording in progress...' : 'Ready to record'}
                </p>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2 justify-center">
                {!isRecording ? (
                  <Button 
                    onClick={handleStartRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-4"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopRecording}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Audio Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Input Volume</label>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Quality</label>
                <select className="w-full px-2 py-1 text-sm border border-border rounded bg-background">
                  <option>High (44.1kHz)</option>
                  <option>Medium (22kHz)</option>
                  <option>Low (16kHz)</option>
                </select>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Test Microphone
              </Button>
            </CardContent>
          </Card>

          {/* Recent Recordings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              {recordings.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No recordings yet
                </div>
              ) : (
                <div className="space-y-2">
                  {recordings.map((recording) => (
                    <div key={recording.id} className="flex items-center gap-2 p-2 rounded border border-border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{recording.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(recording.duration)} • {recording.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => handleDeleteRecording(recording.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
};

export default AudioRecordingColumn; 