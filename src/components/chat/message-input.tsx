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

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendPaidMessage: (content: { title: string; price: number; imageUrl: string; }) => void;
  isCreator: boolean;
}

export function MessageInput({ onSendMessage, onSendPaidMessage, isCreator }: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  
  // State for the paid content popover
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handlePaidSubmit = () => {
    const numericPrice = parseFloat(price);
    if (title.trim() && !isNaN(numericPrice) && numericPrice > 0 && imageUrl.trim()) {
      onSendPaidMessage({
        title: title.trim(),
        price: numericPrice,
        imageUrl: imageUrl.trim(),
      });
      // Reset form and close popover
      setTitle('');
      setPrice('');
      setImageUrl('');
      setPopoverOpen(false);
    } else {
      // Basic validation feedback
      alert('Veuillez remplir tous les champs correctement.');
    }
  };


  return (
    <div className="flex gap-2 items-center">
      {isCreator && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
                  <Input id="title" placeholder="Titre du contenu" className="col-span-2 h-8" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="price">Prix</Label>
                  <Input id="price" type="number" placeholder="9.99" className="col-span-2 h-8" value={price} onChange={e => setPrice(e.target.value)}/>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="image-url">URL Image</Label>
                  <Input id="image-url" placeholder="https://..." className="col-span-2 h-8" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
              </div>
              <Button onClick={handlePaidSubmit}>Envoyer le Contenu Payant</Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
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
