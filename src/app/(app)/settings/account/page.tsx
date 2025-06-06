import { Separator } from "@/components/ui/separator"
import { AccountForm } from "@/components/settings/account-form"

export default function SettingsAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings. Set your preferred language and date of birth.
        </p>
      </div>
      <Separator />
      <AccountForm />
    </div>
  )
} 