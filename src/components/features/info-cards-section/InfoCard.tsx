"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

interface InfoCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  modalTitle: string;
  modalContent: React.ReactNode; // Placeholder content for the modal
}

export function InfoCard({ title, description, icon: Icon, modalTitle, modalContent }: InfoCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">{description}</CardDescription>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          {/* <DialogDescription>
            This description can be more generic or removed if modalContent is comprehensive
          </DialogDescription> */}
        </DialogHeader>
        <div className="py-4">
          {modalContent}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 