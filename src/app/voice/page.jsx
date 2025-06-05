"use client";

import { useState, useContext, useEffect } from "react";
import { Mic, Play, Settings, Info, Crown, Zap, X, Edit, Users, User, ArrowLeft, CheckCircle, FileText, Trash2, MoreHorizontal, Plus, Save, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthContext } from "@/contexts/AuthContext";
import { getUserVoiceProfiles, setActiveVoiceProfile, deleteVoiceProfile } from "@/lib/firestoreService";
import ResizablePanelLayout, { usePanelConfig } from "@/components/layout/ResizablePanelLayout";

// Voice Configuration Panel Component
const VoiceConfigurationPanel = ({ activeVoiceProfile, voiceInfluenceSettings, onSettingsChange }) => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Voice Engine Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Configure how your active voice profile influences script generation
        </p>
      </div>

      {activeVoiceProfile ? (
        <div className="space-y-6">
          {/* Active Voice Profile Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Active Voice Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{activeVoiceProfile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeVoiceProfile.platform} • {activeVoiceProfile.analysisData?.videosAnalyzed || 0} videos analyzed
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Voice DNA Summary</Label>
                <div className="space-y-1">
                  {activeVoiceProfile.voiceProfile?.actionableSystemPromptComponents?.voiceDnaSummaryDirectives?.slice(0, 3).map((directive, index) => (
                    <p key={index} className="text-xs text-muted-foreground">• {directive.replace(/\*\*/g, '')}</p>
                  )) || (
                    <p className="text-xs text-muted-foreground">• Maintains conversational and engaging tone</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Component Influence Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Component Influence Settings</CardTitle>
              <CardDescription className="text-xs">
                Choose which script components should be influenced by your voice profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'hooks', label: 'Hook Structure', description: 'Apply voice style to hook generation' },
                { key: 'bridges', label: 'Bridge Structure', description: 'Apply voice style to bridge transitions' },
                { key: 'goldenNuggets', label: 'Golden Nugget Structure', description: 'Apply voice style to value content delivery' },
                { key: 'wtas', label: 'Call to Action Structure', description: 'Apply voice style to CTAs' },
                { key: 'languagePatterns', label: 'Overall Language Patterns', description: 'Apply grammar and sentence complexity preferences' },
                { key: 'toneApplication', label: 'Tone of Voice Application', description: 'Apply tonal characteristics throughout' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between space-x-3">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm font-medium">{setting.label}</Label>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    checked={voiceInfluenceSettings[setting.key] || false}
                    onCheckedChange={(checked) => onSettingsChange(setting.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Voice Application Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Active Influences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(voiceInfluenceSettings).filter(([_, enabled]) => enabled).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No voice influences currently active</p>
                ) : (
                  Object.entries(voiceInfluenceSettings)
                    .filter(([_, enabled]) => enabled)
                    .map(([key, _]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Badge>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Mic className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">No Active Voice Profile</h3>
            <p className="text-sm text-muted-foreground">Create and activate a voice profile to configure voice engine settings</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook Structure Library Panel Component
const HookStructurePanel = ({ customHooks, onAddHook, onEditHook, onDeleteHook, onToggleHookActive }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHook, setNewHook] = useState({ title: '', template: '', example: '', category: 'question' });

  const handleSaveHook = () => {
    if (newHook.title && newHook.template) {
      onAddHook({
        ...newHook,
        id: Date.now().toString(),
        isActive: true,
        createdAt: new Date().toISOString()
      });
      setNewHook({ title: '', template: '', example: '', category: 'question' });
      setShowAddForm(false);
    }
  };

  const hookCategories = [
    { value: 'question', label: 'Question Hook', description: 'Engage with thought-provoking questions' },
    { value: 'bold', label: 'Bold Statement', description: 'Start with surprising or controversial statements' },
    { value: 'story', label: 'Story Hook', description: 'Begin with personal anecdotes or stories' },
    { value: 'statistic', label: 'Statistic Hook', description: 'Open with compelling data or numbers' },
    { value: 'problem', label: 'Problem Hook', description: 'Address common pain points immediately' }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Hook Structure Library</h2>
          <p className="text-sm text-muted-foreground">
            Manage your preferred hook structures for consistent script generation
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Hook
        </Button>
      </div>

      {/* Add Hook Form */}
      {showAddForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Create New Hook Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hookTitle" className="text-sm">Hook Title</Label>
              <Input
                id="hookTitle"
                placeholder="e.g., Question Hook"
                value={newHook.title}
                onChange={(e) => setNewHook(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hookCategory" className="text-sm">Category</Label>
              <select
                id="hookCategory"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={newHook.category}
                onChange={(e) => setNewHook(prev => ({ ...prev, category: e.target.value }))}
              >
                {hookCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hookTemplate" className="text-sm">Template Structure</Label>
              <Textarea
                id="hookTemplate"
                placeholder="e.g., Are you [TARGET AUDIENCE] struggling with [SPECIFIC PROBLEM]? Here's why [COMMON APPROACH] isn't working..."
                value={newHook.template}
                onChange={(e) => setNewHook(prev => ({ ...prev, template: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hookExample" className="text-sm">Example</Label>
              <Textarea
                id="hookExample"
                placeholder="Provide a concrete example of this hook in action"
                value={newHook.example}
                onChange={(e) => setNewHook(prev => ({ ...prev, example: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveHook} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Hook
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hook Library */}
      <div className="space-y-4">
        {customHooks.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">No Custom Hooks Yet</h3>
              <p className="text-sm text-muted-foreground">Create custom hook structures to ensure consistent script generation</p>
            </div>
          </div>
        ) : (
          customHooks.map(hook => (
            <Card key={hook.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{hook.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {hookCategories.find(c => c.value === hook.category)?.label || hook.category}
                      </Badge>
                      <Switch
                        checked={hook.isActive}
                        onCheckedChange={(checked) => onToggleHookActive(hook.id, checked)}
                        className="ml-auto"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{hook.template}</p>
                    {hook.example && (
                      <div className="bg-muted/50 rounded-md p-2 mt-2">
                        <p className="text-xs italic">&quot;{hook.example}&quot;</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => onEditHook(hook.id)} className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteHook(hook.id)} className="h-8 w-8 p-0 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Platform Icons
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Voice Card Component
const VoiceCard = ({ voice, onActivate, onEdit, onDelete, isActive }) => {
  const formatDate = (date) => {
    let dateObj;
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = new Date();
    }
    
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400';
      case 'tiktok': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
      case 'twitter': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'linkedin': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'threads': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              {voice.sourceProfile?.profileImage ? (
                <img 
                  src={voice.sourceProfile.profileImage} 
                  alt={voice.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
              voice.status === 'ready' ? 'bg-green-500' : 
              voice.status === 'training' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <h3 className="font-medium text-sm truncate">{voice.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getPlatformColor(voice.platform)}`}>
                    {voice.platform === 'instagram' && <InstagramIcon className="w-3 h-3 mr-1" />}
                    {voice.platform === 'tiktok' && <TikTokIcon className="w-3 h-3 mr-1" />}
                    {voice.platform.charAt(0).toUpperCase() + voice.platform.slice(1)}
                  </Badge>
                  {isActive && (
                    <Badge variant="default" className="text-xs">Active</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(voice.id)} className="h-6 w-6 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(voice.id)} className="h-6 w-6 p-0 hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {voice.analysisData?.videosAnalyzed || 0} videos • {formatDate(voice.createdAt)}
              </p>
              
              {!isActive && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onActivate(voice.id)}
                  className="h-7 text-xs"
                  disabled={voice.status !== 'ready'}
                >
                  <Play className="mr-1 h-3 w-3" />
                  Activate
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Voice Management Panel Component
const VoiceManagementPanel = ({ voices, onCreateVoice, onActivateVoice, onEditVoice, onDeleteVoice, activeVoiceProfile }) => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Voice Profiles</h2>
          <p className="text-sm text-muted-foreground">
            Manage your AI voice profiles for script generation
          </p>
        </div>
        <Button onClick={onCreateVoice} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Voice
        </Button>
      </div>

      {/* Active Voice Profile Display */}
      {activeVoiceProfile && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" />
              Active Voice Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">{activeVoiceProfile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {activeVoiceProfile.platform} • {activeVoiceProfile.analysisData?.videosAnalyzed || 0} videos analyzed
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Voice Characteristics</Label>
              <div className="flex flex-wrap gap-1">
                {activeVoiceProfile.voiceProfile?.coreIdentity?.dominantTones?.slice(0, 3).map((tone, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">{tone}</Badge>
                )) || (
                  <Badge variant="secondary" className="text-xs">Conversational</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Profiles List */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">All Voice Profiles ({voices.length})</Label>
        
        {voices.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Mic className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">No Voice Profiles Yet</h3>
              <p className="text-sm text-muted-foreground">Create your first voice profile to get started</p>
            </div>
          </div>
        ) : (
          voices.map(voice => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              onActivate={onActivateVoice}
              onEdit={onEditVoice}
              onDelete={onDeleteVoice}
              isActive={voice.isActive}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Voice Creation Modal Component
const VoiceCreationModal = ({ 
  isOpen, 
  modalStep, 
  platforms, 
  selectedPlatform, 
  setSelectedPlatform, 
  creatorInput, 
  handleCreatorInputChange, 
  isProcessing, 
  processingStep, 
  processingSteps, 
  analysisResults, 
  onClose, 
  onBackToMethods, 
  onCloneCreator, 
  onCreateCloneVoice, 
  onConfirmVoiceCreation 
}) => {
  if (!isOpen) return null;

  const detectPlatformFromUrl = (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('instagram.com')) return 'instagram';
      if (hostname.includes('tiktok.com')) return 'tiktok';
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
      if (hostname.includes('linkedin.com')) return 'linkedin';
      if (hostname.includes('threads.net')) return 'threads';
      
      return null;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-primary-foreground hover:text-primary-foreground/80">
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Create AI Voice Profile</h2>
          <p className="text-primary-foreground/90">
            Clone any creator&apos;s writing style from their social media profile
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {modalStep === "selection" && (
            <div className="flex justify-center">
              <Card 
                className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/20 max-w-sm w-full"
                onClick={onCloneCreator}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Clone a Creator</h3>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Analyze any creator&apos;s profile to replicate their writing style and tone
                  </p>
                  <Button variant="link" className="text-purple-600 p-0 h-auto font-medium">
                    Choose creator →
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {modalStep === "clone-creator" && (
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Platform</h3>
                <div className="flex gap-3">
                  {platforms.map((platform) => {
                    const IconComponent = platform.icon;
                    const isSelected = selectedPlatform === platform.id;
                    const isAutoDetected = detectPlatformFromUrl(creatorInput) === platform.id;
                    return (
                      <Button
                        key={platform.id}
                        variant="outline"
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={`px-4 py-2 border-2 transition-all relative ${
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {platform.name}
                        {isAutoDetected && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Creator Input */}
              <div>
                <Label className="text-sm font-medium mb-2">Creator Profile URL</Label>
                <Input
                  placeholder="@username or profile URL"
                  value={creatorInput}
                  onChange={handleCreatorInputChange}
                  className="w-full"
                />
                {creatorInput && detectPlatformFromUrl(creatorInput) && (
                  <p className="text-sm text-green-600 mt-2">✓ Platform auto-detected</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={onBackToMethods}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={onCreateCloneVoice}
                  disabled={!creatorInput.trim()}
                  className="bg-primary text-primary-foreground"
                >
                  Create Voice Profile
                </Button>
              </div>
            </div>
          )}

          {modalStep === "processing" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Analyzing Voice Profile</h3>
                <p className="text-muted-foreground">Processing {creatorInput}...</p>
              </div>

              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      index < processingStep ? 'bg-green-500 text-white' :
                      index === processingStep ? 'bg-blue-500 text-white animate-pulse' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index < processingStep ? '✓' : step.id}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Progress value={((processingStep + 1) / processingSteps.length) * 100} />
            </div>
          )}

          {modalStep === "profile-review" && analysisResults && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Voice Profile Created!</h3>
                <p className="text-muted-foreground">
                  Successfully analyzed {analysisResults.analysisData?.videosAnalyzed || 0} videos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Voice Identity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Persona</Label>
                      <p className="text-sm">{analysisResults.voiceProfile?.coreIdentity?.suggestedPersonaName || 'Content Creator Voice'}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Dominant Tones</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(analysisResults.voiceProfile?.coreIdentity?.dominantTones || ['Conversational']).map((tone, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{tone}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Content Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Hook Strategies</Label>
                      <div className="space-y-1">
                        {(analysisResults.voiceProfile?.contentStrategyBlueprints?.commonHookStrategies || []).slice(0, 2).map((hook, index) => (
                          <div key={index}>
                            <Badge variant="outline" className="text-xs">{hook.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={onConfirmVoiceCreation} className="bg-green-600 text-white">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate Voice
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VoicePage = () => {
  const [activeVoice, setActiveVoice] = useState(null);
  const [activeTab, setActiveTab] = useState("custom");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalStep, setModalStep] = useState("selection");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [creatorInput, setCreatorInput] = useState("");
  const [voices, setVoices] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Voice Engine Configuration State
  const [voiceInfluenceSettings, setVoiceInfluenceSettings] = useState({
    hooks: false,
    bridges: false,
    goldenNuggets: false,
    wtas: false,
    languagePatterns: false,
    toneApplication: false
  });
  
  // Custom Hook Structures State
  const [customHooks, setCustomHooks] = useState([]);
  
  const { userProfile } = useContext(AuthContext);
  const { createPanel } = usePanelConfig();

  // Load voice profiles and settings from database on component mount
  useEffect(() => {
    const loadVoiceProfiles = async () => {
      if (!userProfile?.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading voice profiles for user:', userProfile.uid);
        const voiceProfiles = await getUserVoiceProfiles(userProfile.uid);
        console.log('Loaded voice profiles:', voiceProfiles);
        
        setVoices(voiceProfiles);
        
        // Set active voice if one exists
        const activeProfile = voiceProfiles.find(profile => profile.isActive);
        if (activeProfile) {
          setActiveVoice(activeProfile.id);
        }
        
        // Load user settings from localStorage (in a real app, this would be from the database)
        const savedInfluenceSettings = localStorage.getItem(`voiceInfluenceSettings_${userProfile.uid}`);
        if (savedInfluenceSettings) {
          setVoiceInfluenceSettings(JSON.parse(savedInfluenceSettings));
        }
        
        const savedCustomHooks = localStorage.getItem(`customHooks_${userProfile.uid}`);
        if (savedCustomHooks) {
          setCustomHooks(JSON.parse(savedCustomHooks));
        }
        
      } catch (error) {
        console.error('Error loading voice profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVoiceProfiles();
  }, [userProfile?.uid]);

  // Save settings to localStorage when they change (in a real app, this would be to the database)
  useEffect(() => {
    if (userProfile?.uid) {
      localStorage.setItem(`voiceInfluenceSettings_${userProfile.uid}`, JSON.stringify(voiceInfluenceSettings));
    }
  }, [voiceInfluenceSettings, userProfile?.uid]);

  useEffect(() => {
    if (userProfile?.uid) {
      localStorage.setItem(`customHooks_${userProfile.uid}`, JSON.stringify(customHooks));
    }
  }, [customHooks, userProfile?.uid]);

  // Voice influence settings handlers
  const handleVoiceInfluenceChange = (setting, enabled) => {
    setVoiceInfluenceSettings(prev => ({
      ...prev,
      [setting]: enabled
    }));
  };

  // Custom hooks handlers
  const handleAddHook = (newHook) => {
    setCustomHooks(prev => [...prev, newHook]);
  };

  const handleEditHook = (hookId) => {
    // TODO: Implement edit functionality
    console.log('Edit hook:', hookId);
  };

  const handleDeleteHook = (hookId) => {
    setCustomHooks(prev => prev.filter(hook => hook.id !== hookId));
  };

  const handleToggleHookActive = (hookId, isActive) => {
    setCustomHooks(prev => prev.map(hook => 
      hook.id === hookId ? { ...hook, isActive } : hook
    ));
  };

  // Processing steps for voice analysis
  const processingSteps = [
    { id: 1, title: "Fetching Videos", description: "Downloading 10 latest posts from profile", duration: 3000 },
    { id: 2, title: "Transcribing Audio", description: "Converting video audio to text", duration: 4000 },
    { id: 3, title: "Analyzing Scripts", description: "Applying Short-Form Video Script Analyst to each transcript", duration: 5000 },
    { id: 4, title: "Synthesizing Profile", description: "Creating comprehensive Voice DNA using Master Voice Profile Synthesizer", duration: 3000 }
  ];

  // Get active voice profile object
  const activeVoiceProfile = voices.find(voice => voice.isActive);

  // Voice management handlers
  const handleCreateVoice = () => {
    setShowCreateModal(true);
    setModalStep("selection");
  };

  const handleCloneCreator = () => {
    setModalStep("clone-creator");
  };

  const handleBackToMethods = () => {
    setModalStep("selection");
  };

  const detectPlatformFromUrl = (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('instagram.com')) {
        return 'instagram';
      } else if (hostname.includes('tiktok.com')) {
        return 'tiktok';
      } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        return 'twitter';
      } else if (hostname.includes('linkedin.com')) {
        return 'linkedin';
      } else if (hostname.includes('threads.net')) {
        return 'threads';
      }
      
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleCreatorInputChange = (e) => {
    const value = e.target.value;
    setCreatorInput(value);
    
    const detectedPlatform = detectPlatformFromUrl(value);
    if (detectedPlatform && platforms.find(p => p.id === detectedPlatform)) {
      setSelectedPlatform(detectedPlatform);
    }
  };

  const handleCreateCloneVoice = async () => {
    if (!creatorInput.trim()) return;

    const detectedPlatform = detectPlatformFromUrl(creatorInput);
    const finalPlatform = detectedPlatform || selectedPlatform;

    setIsProcessing(true);
    setModalStep("processing");
    setProcessingStep(0);

    try {
      for (let i = 0; i < processingSteps.length; i++) {
        setProcessingStep(i);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (i === processingSteps.length - 1) {
          console.log('Calling voice profile API...');
          
          const response = await fetch('/api/create-voice-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profileUrl: creatorInput,
              platform: finalPlatform,
              userId: userProfile?.uid
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create voice profile');
          }

          const data = await response.json();
          console.log('Voice profile created:', data);
          
          setAnalysisResults(data);
        
          await new Promise(resolve => setTimeout(resolve, processingSteps[i].duration - 1500));
        }
      }

      setModalStep("profile-review");
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Error creating voice profile:', error);
      setIsProcessing(false);
      alert('Error creating voice profile: ' + error.message);
    }
  };

  const handleConfirmVoiceCreation = async () => {
    if (!analysisResults || !userProfile?.uid) return;

    try {
      const updatedVoices = await getUserVoiceProfiles(userProfile.uid);
      setVoices(updatedVoices);
      
      closeModal();
    } catch (error) {
      console.error('Error refreshing voice profiles:', error);
      closeModal();
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setModalStep("selection");
    setCreatorInput("");
    setIsProcessing(false);
    setProcessingStep(0);
    setAnalysisResults(null);
  };

  const handleActivateVoice = async (voiceId) => {
    if (!userProfile?.uid) return;

    try {
      await setActiveVoiceProfile(userProfile.uid, voiceId);
      
      setVoices(prev => prev.map(voice => ({
        ...voice,
        isActive: voice.id === voiceId
      })));
      setActiveVoice(voiceId);
    } catch (error) {
      console.error('Error activating voice:', error);
      alert('Failed to activate voice profile');
    }
  };

  const handleEditVoice = (voiceId) => {
    console.log('Edit voice:', voiceId);
  };

  const handleDeleteVoice = async (voiceId) => {
    if (!userProfile?.uid) return;
    
    if (!confirm('Are you sure you want to delete this voice profile?')) return;

    try {
      await deleteVoiceProfile(userProfile.uid, voiceId);
      setVoices(prev => prev.filter(voice => voice.id !== voiceId));
      
      if (activeVoice === voiceId) {
        setActiveVoice(null);
      }
    } catch (error) {
      console.error('Error deleting voice:', error);
      alert('Failed to delete voice profile');
    }
  };

  // Platform options for voice creation
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: InstagramIcon, description: 'Clone voice from Instagram Reels' },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, description: 'Clone voice from TikTok videos' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading voice profiles...</p>
        </div>
      </div>
    );
  }

  // Configure panels
  const panels = [
    // Voice Profile Management Panel
    createPanel(
      "voice-management",
      <VoiceManagementPanel 
        voices={voices}
        onCreateVoice={handleCreateVoice}
        onActivateVoice={handleActivateVoice}
        onEditVoice={handleEditVoice}
        onDeleteVoice={handleDeleteVoice}
        activeVoiceProfile={activeVoiceProfile}
      />,
      { default: 35, min: 25, max: 50 },
      { scrollable: true }
    ),
    
    // Voice Configuration Panel
    createPanel(
      "voice-configuration",
      <VoiceConfigurationPanel 
        activeVoiceProfile={activeVoiceProfile}
        voiceInfluenceSettings={voiceInfluenceSettings}
        onSettingsChange={handleVoiceInfluenceChange}
      />,
      { default: 35, min: 25, max: 50 },
      { scrollable: true }
    ),
    
    // Hook Structure Library Panel
    createPanel(
      "hook-library",
      <HookStructurePanel 
        customHooks={customHooks}
        onAddHook={handleAddHook}
        onEditHook={handleEditHook}
        onDeleteHook={handleDeleteHook}
        onToggleHookActive={handleToggleHookActive}
      />,
      { default: 30, min: 25, max: 50 },
      { scrollable: true }
    )
  ];

  return (
    <div className="h-screen bg-background">
      <div className="border-b bg-card p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Voice Engine Studio</h1>
          <p className="text-sm text-muted-foreground">
            Configure voice profiles, component influences, and custom structures for AI script generation
          </p>
        </div>
      </div>
      
      <div className="h-[calc(100vh-120px)]">
        <ResizablePanelLayout
          direction="horizontal"
          panels={panels}
        />
      </div>
      
      {/* Voice Creation Modal - keeping existing modal logic */}
      {showCreateModal && (
        <VoiceCreationModal 
          isOpen={showCreateModal}
          modalStep={modalStep}
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          creatorInput={creatorInput}
          handleCreatorInputChange={handleCreatorInputChange}
          isProcessing={isProcessing}
          processingStep={processingStep}
          processingSteps={processingSteps}
          analysisResults={analysisResults}
          onClose={closeModal}
          onBackToMethods={handleBackToMethods}
          onCloneCreator={handleCloneCreator}
          onCreateCloneVoice={handleCreateCloneVoice}
          onConfirmVoiceCreation={handleConfirmVoiceCreation}
        />
      )}
    </div>
  );
};

export default VoicePage;