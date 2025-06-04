'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Mic, Settings, Clock, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SecondaryColumnProps {
  isVisible: boolean;
  onClose: () => void;
}

const SecondaryColumn: React.FC<SecondaryColumnProps> = ({
  isVisible,
  onClose
}) => {
  return (
    <div className={`
      fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50
      transform transition-transform duration-300 ease-in-out
      ${isVisible ? 'translate-x-0' : 'translate-x-full'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          Voice Recording
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="h-full pb-16">
        <div className="p-4 space-y-6">
          
          {/* Recording Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Recording Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Ready to record</p>
                <p className="text-xs text-muted-foreground mt-1">Click the floating recorder to start</p>
              </div>
            </CardContent>
          </Card>

          {/* Recording Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Recording Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Speak clearly and at a steady pace</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Find a quiet environment</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Keep your microphone at a consistent distance</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Pause briefly between sentences</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Recordings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Recordings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-4">
                No recordings yet
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                Test Microphone
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Audio Quality Settings
              </Button>
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
};

export default SecondaryColumn; 