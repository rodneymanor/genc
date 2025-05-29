import { Search, Brain } from "lucide-react" // Added Brain for potential use
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// StandardizedInputGroup component - consider moving to a shared components folder
const StandardizedInputGroup = ({ placeholder, className = "", icon: Icon = Search }) => {
  return (
    <div className={`relative w-full max-w-xl mx-auto ${className}`}>
      <Icon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-12 pr-4 py-3 h-14 text-lg border-2 border-border focus:border-primary transition-colors rounded-lg shadow-sm hover:shadow-md"
      />
    </div>
  )
}

// ActionButton component using ShadCN Button
const ActionButton = ({ children, onClick, className = "", icon: Icon }) => {
  return (
    <Button
      onClick={onClick}
      className={`w-full max-w-xs mx-auto py-3 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow ${className}`}
      size="lg"
    >
      {Icon && <Icon className="mr-2 h-5 w-5" />}
      {children}
    </Button>
  )
}

export default function IdeaInputScreen() {
  const handleGenerateOutlines = () => {
    // Placeholder for actual outline generation logic
    console.log("Generating outlines...")
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Page Title */}
        <h1 className="text-4xl font-bold tracking-tight">
          2. Create Script - Idea Input
        </h1>

        {/* Main Content Area */}
        <div className="space-y-6 py-8">
          <StandardizedInputGroup
            placeholder="e.g., 'benefits of mindfulness for busy professionals'"
            icon={Brain} // Using Brain icon for "idea" input
          />
          
          <ActionButton 
            onClick={handleGenerateOutlines}
          >
            Generate Outlines
          </ActionButton>

          <p className="text-sm text-muted-foreground px-4">
            Our AI will craft outlines based on the Seven Laws.
          </p>
        </div>

        {/* Optional: Footer or navigation placeholder */}
        <div className="pt-8">
          <p className="text-xs text-muted-foreground">
            Ensure your idea is clear and concise for the best results.
          </p>
        </div>
      </div>
    </div>
  )
} 