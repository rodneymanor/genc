"use client";

import { InfoCard } from "./InfoCard";
import { Newspaper, Sparkles, Zap } from "lucide-react"; // Example icons

const cardData = [
  {
    id: "whats-new",
    title: "What's New in Scribo?",
    description: "Check out the latest features, improvements, and updates to enhance your scriptwriting workflow.",
    icon: Newspaper,
    modalTitle: "Latest Updates & Features",
    modalContent: (
      <div>
        <p className="mb-2">Welcome to the newest version of Scribo!</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>New AI-powered outline suggestions.</li>
          <li>Improved collaboration tools.</li>
          <li>Enhanced export options.</li>
          <li>Performance optimizations for a smoother experience.</li>
        </ul>
        <p className="mt-4">More details coming soon!</p>
      </div>
    ),
  },
  {
    id: "script-tips",
    title: "Short Form Script Writing Tips",
    description: "Unlock secrets to crafting compelling short-form video scripts that captivate your audience.",
    icon: Sparkles, // Using Sparkles as an example for "tips" or "creativity"
    modalTitle: "Tips for Engaging Short Form Scripts",
    modalContent: (
      <div>
        <p className="mb-2">Boost your short-form video engagement with these quick tips:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Start with a strong hook within the first 3 seconds.</li>
          <li>Keep your message concise and to the point.</li>
          <li>Use trending audio and visual styles effectively.</li>
          <li>End with a clear call to action or a memorable takeaway.</li>
          <li>Analyze performance and iterate!</li>
        </ul>
         <p className="mt-4">Explore our blog for more in-depth guides!</p>
      </div>
    ),
  },
  {
    id: "scribo-pro",
    title: "Discover Scribo Pro",
    description: "Elevate your content creation with advanced features, unlimited access, and priority support.",
    icon: Zap, // Zap icon for "Pro" or "power" features
    modalTitle: "Unlock Scribo Pro Benefits",
    modalContent: (
      <div>
        <p className="mb-2">Scribo Pro empowers you with:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Unlimited script generations.</li>
          <li>Access to premium script templates and AI models.</li>
          <li>Advanced analytics for your content.</li>
          <li>Priority customer support.</li>
          <li>Early access to new features.</li>
        </ul>
        <p className="mt-4 font-semibold">Upgrade today to revolutionize your workflow!</p>
      </div>
    ),
  },
];

export function InfoCardsSection() {
  if (cardData.length === 0) {
    return null; // Don't render the section if there's no data
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 mb-8">
      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
        {cardData.map((card) => (
          <InfoCard
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            modalTitle={card.modalTitle}
            modalContent={card.modalContent}
          />
        ))}
      </div>
    </div>
  );
} 