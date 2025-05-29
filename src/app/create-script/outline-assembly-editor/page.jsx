"use client";

import { useState } from 'react';
import { GripVertical, PlusCircle, Save, Download, BarChart3, Sparkles, Edit3, MessageSquare, Type, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Enhanced StandardizedInputGroup for various types
const StandardizedInputGroup = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  inputType = "text", // 'text', 'textarea', 'select'
  options = [], // for select type
  icon: Icon,
  className = "",
  inputClassName = "",
  rows = 3 // for textarea
}) => {
  const commonInputClass = "border-2 border-border focus:border-primary transition-colors rounded-lg shadow-sm hover:shadow-md";
  
  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && <Label htmlFor={id} className="text-sm font-medium text-muted-foreground flex items-center">{Icon && <Icon className="h-4 w-4 mr-2 text-primary" />}{label}</Label>}
      {inputType === 'textarea' ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${commonInputClass} min-h-[80px] text-base p-3 ${inputClassName}`}
          rows={rows}
        />
      ) : inputType === 'select' ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} className={`${commonInputClass} h-12 text-base ${inputClassName}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${commonInputClass} h-12 text-base px-3 ${inputClassName}`}
        />
      )}
    </div>
  );
};

// ActionButton (can be moved to shared components)
const ActionButton = ({ children, onClick, variant = "default", className = "", icon: Icon, size = "default" }) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={`font-semibold shadow-sm hover:shadow-md transition-shadow ${className}`}
      size={size}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
};


export default function OutlineAssemblyEditorPage() {
  const [scriptTitle, setScriptTitle] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("default");
  const [hook, setHook] = useState("");
  const [bridge, setBridge] = useState("");
  const [wta, setWta] = useState("");
  const [goldenNuggets, setGoldenNuggets] = useState([{ id: Date.now(), text: "" }]);

  const toneOptions = [
    { value: "default", label: "Default Tone" },
    { value: "ryan_reynolds", label: "Inspired by: Ryan Reynolds (Witty, Sarcastic)" },
    { value: "david_attenborough", label: "Inspired by: David Attenborough (Calm, Authoritative)" },
    { value: "casey_neistat", label: "Inspired by: Casey Neistat (Energetic, Authentic)" },
    { value: "informative_expert", label: "Informative & Expert" },
    { value: "friendly_casual", label: "Friendly & Casual" },
  ];

  const handleAddNugget = () => {
    setGoldenNuggets([...goldenNuggets, { id: Date.now(), text: "" }]);
  };

  const handleNuggetChange = (id, newText) => {
    setGoldenNuggets(goldenNuggets.map(nugget => nugget.id === id ? { ...nugget, text: newText } : nugget));
  };

  const handleRemoveNugget = (id) => {
    setGoldenNuggets(goldenNuggets.filter(nugget => nugget.id !== id));
  };
  
  // Placeholder action handlers
  const handleSaveScript = () => console.log("Saving script:", { scriptTitle, toneOfVoice, hook, bridge, goldenNuggets, wta });
  const handleExportScript = () => console.log("Exporting script...");
  const handleAnalyzeScript = () => console.log("Analyzing script...");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8 px-4 md:px-6">
      <div className="container mx-auto space-y-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center text-foreground mb-10">
          4. Create Script - Outline Assembly & Editor
        </h1>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Script Foundation</CardTitle>
            <CardDescription>Define the core elements of your script.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <StandardizedInputGroup
              label="Script Title"
              id="scriptTitle"
              placeholder="e.g., The Ultimate Guide to Mindful Mornings"
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
              icon={Type}
            />
            <StandardizedInputGroup
              label="Tone of Voice"
              id="toneOfVoice"
              inputType="select"
              value={toneOfVoice}
              onChange={setToneOfVoice} // ShadCN Select passes value directly
              options={toneOptions}
              placeholder="Select a tone"
              icon={Palette}
            />
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Content Blocks</CardTitle>
            <CardDescription>Craft each section of your script. Click and type to edit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <StandardizedInputGroup
              label="Hook"
              id="hook"
              placeholder="Grab your audience's attention in the first few seconds..."
              inputType="textarea"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              rows={4}
              icon={Sparkles}
            />
            <StandardizedInputGroup
              label="Bridge"
              id="bridge"
              placeholder="Transition smoothly from your hook to the main content..."
              inputType="textarea"
              value={bridge}
              onChange={(e) => setBridge(e.target.value)}
              rows={3}
              icon={Edit3}
            />

            {/* Golden Nuggets Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground flex items-center"><Sparkles className="h-4 w-4 mr-2 text-primary" />Golden Nuggets (Drag to reorder - visual only)</Label>
              {goldenNuggets.map((nugget, index) => (
                <div key={nugget.id} className="flex items-center space-x-2 group p-1 rounded-md hover:bg-muted/50">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab group-hover:text-primary transition-colors" aria-label="Drag to reorder nugget" />
                  <Textarea
                    placeholder={`Nugget ${index + 1}...`}
                    value={nugget.text}
                    onChange={(e) => handleNuggetChange(nugget.id, e.target.value)}
                    className="flex-grow border-2 border-border focus:border-primary transition-colors rounded-lg shadow-sm p-2 min-h-[60px]"
                    rows={2}
                  />
                  {goldenNuggets.length > 1 && (
                     <Button variant="ghost" size="sm" onClick={() => handleRemoveNugget(nugget.id)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/80">
                       &times;
                     </Button>
                   )}
                </div>
              ))}
              <ActionButton onClick={handleAddNugget} variant="outline" size="sm" icon={PlusCircle} className="w-full md:w-auto">
                Add Golden Nugget
              </ActionButton>
            </div>
             <Separator />
            <StandardizedInputGroup
              label="What To Action (WTA)"
              id="wta"
              placeholder="Tell your audience what to do next (e.g., subscribe, comment, visit link)..."
              inputType="textarea"
              value={wta}
              onChange={(e) => setWta(e.target.value)}
              rows={3}
              icon={MessageSquare}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row justify-end items-center space-y-3 md:space-y-0 md:space-x-3 pt-6">
          <ActionButton onClick={handleAnalyzeScript} variant="outline" icon={BarChart3} className="w-full md:w-auto">Analyze This Script</ActionButton>
          <ActionButton onClick={handleExportScript} variant="outline" icon={Download} className="w-full md:w-auto">Export Script</ActionButton>
          <ActionButton onClick={handleSaveScript} variant="default" icon={Save} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">Save Script</ActionButton>
        </div>
      </div>
    </div>
  );
} 