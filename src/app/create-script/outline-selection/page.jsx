"use client";

import { useState } from 'react';
import { AlertCircle, CheckCircle, Sparkles, MessageSquare, Edit3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Placeholder data for one outline option
const placeholderOutlineData = {
  hook: {
    suggestions: [
      { id: "h1", text: "Ever wondered how top creators hook viewers in seconds?" },
      { id: "h2", text: "Unlock the secret to captivating intros that work." },
    ],
  },
  bridge: {
    suggestion: "Today, we're diving deep into the strategies that turn casual scrollers into loyal fans.",
  },
  goldenNuggets: [
    { id: "gn1", text: "The 'Pattern Interrupt' technique." },
    { id: "gn2", text: "Using curiosity gaps effectively." },
    { id: "gn3", text: "Emotional resonance in the first 5 seconds." },
  ],
  wta: { // What To Action (Call to Action)
    suggestions: [
      { id: "wta1", text: "Subscribe for more insights like these!" },
      { id: "wta2", text: "Try these techniques in your next video and see the difference." },
    ],
  },
};

// OutlineOptionCard Component
const OutlineOptionCard = ({ optionNumber, outlineData }) => {
  const [selectedHook, setSelectedHook] = useState(outlineData.hook.suggestions[0]?.id || null);
  const [selectedWTA, setSelectedWTA] = useState(outlineData.wta.suggestions[0]?.id || null);

  const handleSelectAndEdit = () => {
    console.log(`Outline Option ${optionNumber} selected with:`, {
      hook: outlineData.hook.suggestions.find(s => s.id === selectedHook)?.text,
      bridge: outlineData.bridge.suggestion,
      goldenNuggets: outlineData.goldenNuggets.map(gn => gn.text),
      wta: outlineData.wta.suggestions.find(s => s.id === selectedWTA)?.text,
    });
    // Placeholder for navigation or state update
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-primary">
        {Icon && <Icon className="h-5 w-5" />}
        <h4 className="font-semibold text-md">{title}</h4>
      </div>
      <div className="pl-2 space-y-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );

  const RadioSuggestionGroup = ({ suggestions, selectedValue, onValueChange, name }) => (
    <RadioGroup name={name} value={selectedValue} onValueChange={onValueChange} className="space-y-1.5">
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="flex items-center space-x-2">
          <RadioGroupItem value={suggestion.id} id={`${name}-${suggestion.id}`} />
          <Label htmlFor={`${name}-${suggestion.id}`} className="font-normal leading-snug cursor-pointer">
            {suggestion.text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Outline Option {optionNumber}</CardTitle>
        <CardDescription>Review and select the best fit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <Section title="Hook" icon={Sparkles}>
          <RadioSuggestionGroup
            suggestions={outlineData.hook.suggestions}
            selectedValue={selectedHook}
            onValueChange={setSelectedHook}
            name={`hook-option-${optionNumber}`}
          />
        </Section>
        <Separator />
        <Section title="Bridge" icon={Edit3}>
          <p className="italic">{outlineData.bridge.suggestion}</p>
        </Section>
        <Separator />
        <Section title="Golden Nuggets" icon={CheckCircle}>
          <ul className="list-disc list-inside space-y-1">
            {outlineData.goldenNuggets.map((nugget) => (
              <li key={nugget.id}>{nugget.text}</li>
            ))}
          </ul>
        </Section>
        <Separator />
        <Section title="What To Action (WTA)" icon={MessageSquare}>
          <RadioSuggestionGroup
            suggestions={outlineData.wta.suggestions}
            selectedValue={selectedWTA}
            onValueChange={setSelectedWTA}
            name={`wta-option-${optionNumber}`}
          />
        </Section>
      </CardContent>
      <div className="p-4 pt-2 mt-auto">
        <Button
          variant="secondary"
          className="w-full font-semibold"
          onClick={handleSelectAndEdit}
        >
          Select & Edit This Outline
        </Button>
      </div>
    </Card>
  );
};


// Main Page Component
export default function OutlineSelectionPage() {
  // For demonstration, using the same placeholder data for three cards
  const outlineOptions = [
    { ...placeholderOutlineData, hook: {...placeholderOutlineData.hook, suggestions: [{id: "h1-opt1", text:"Hook Opt 1 Sug 1"}, {id: "h2-opt1", text:"Hook Opt 1 Sug 2"}]}},
    { ...placeholderOutlineData, bridge: {suggestion: "Bridge for Option 2 is slightly different."}, goldenNuggets: [{id:"gn1-opt2", text:"Nugget 2.1"}, {id:"gn2-opt2", text:"Nugget 2.2"}]},
    { ...placeholderOutlineData, wta: {...placeholderOutlineData.wta, suggestions: [{id: "wta1-opt3", text:"WTA Opt 3 Sug 1"}, {id: "wta2-opt3", text:"WTA Opt 3 Sug 2"}]}},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8 px-4 md:px-6">
      <div className="container mx-auto space-y-8">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center text-foreground">
          3. Create Script - Outline Selection
        </h1>

        {/* Guidance Alert */}
        <Alert className="border-primary/50 bg-primary/5 text-primary">
          <AlertCircle className="h-5 w-5 !text-primary" />
          <AlertTitle className="font-semibold">Seven Laws Guidance</AlertTitle>
          <AlertDescription>
            Review each AI-generated outline. Ensure it aligns with the Seven Laws of Content Creation for maximum impact. Pay attention to the hook, bridge, value delivery (golden nuggets), and call to action.
          </AlertDescription>
        </Alert>

        {/* Outline Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlineOptions.map((data, index) => (
            <OutlineOptionCard
              key={index}
              optionNumber={index + 1}
              outlineData={data}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 