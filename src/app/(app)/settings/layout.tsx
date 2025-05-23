import { Metadata } from "next"
import Image from "next/image"

import { Separator } from "@/components/ui/separator" // Adjusted path
import { SidebarNav } from "@/components/settings/sidebar-nav" // Adjusted path

export const metadata: Metadata = {
  title: "Settings", // Changed title
  description: "Manage your account settings and preferences.", // Changed description
}

// TODO: Update href paths to match your actual application routes, e.g., /settings/profile, /settings/account
const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings", // Or /settings/profile if you prefer explicit profile path
  },
  {
    title: "Account",
    href: "/settings/account",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      {/* Mobile placeholder images removed for now, can be replaced with a mobile-friendly nav or your own images */}
      {/* <div className="md:hidden"> ... </div> */}
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
      {/* Fallback for mobile: Consider a drawer or simpler list for settings navigation on smaller screens */}
      <div className="p-4 md:hidden">
        <p className="text-muted-foreground mb-4">Settings navigation is available on larger screens.</p>
        <p className="text-muted-foreground">Alternatively, implement a mobile-friendly navigation (e.g., a select dropdown or a drawer).</p>
        {/* Basic list as a simple mobile fallback for now */}
        <div className="space-y-2">
          {sidebarNavItems.map(item => (
            <a key={item.title} href={item.href} className="block p-2 hover:bg-muted rounded-md">{item.title}</a>
          ))}
        </div>
        <Separator className="my-6" />
        {children} { /* Render children on mobile too, below the message */}
      </div>
    </>
  )
} 