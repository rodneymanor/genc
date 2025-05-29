import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="w-full py-6 text-center border-t border-border mt-auto bg-background shrink-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground md:justify-start">
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/pro">Pro</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/enterprise">Enterprise</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/api">API</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/careers">Careers</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/store">Store</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/finance">Finance</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/help-center">Help Center</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/terms">Terms</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary h-auto p-1">
              <Link href="/privacy">Privacy</Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-muted-foreground">
              English
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 