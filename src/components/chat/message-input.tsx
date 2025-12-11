'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, SendHorizonal } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  // TODO: Add onSendPaidMessage
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {/* TODO: Check if user is a creator before showing this button */}
      <Popover>
        <PopoverTrigger asChild>
           <Button variant="ghost" size="icon">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Send Paid Message</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Contenu Payant</h4>
              <p className="text-sm text-muted-foreground">
                Configurez les détails de votre message payant.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" placeholder="Titre du contenu" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="price">Prix</Label>
                <Input id="price" type="number" placeholder="9.99" className="col-span-2 h-8" />
              </div>
               <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="image-url">URL Image</Label>
                <Input id="image-url" placeholder="https://..." className="col-span-2 h-8" />
              </div>
            </div>
             <Button>Envoyer le Contenu Payant</Button>
          </div>
        </PopoverContent>
      </Popover>

      <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Écrivez un message..."
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!inputValue.trim()}>
          <SendHorizonal className="h-5 w-5" />
          <span className="sr-only">Envoyer</span>
        </Button>
      </form>
    </div>
  );
}
