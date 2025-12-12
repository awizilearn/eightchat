'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      setTitle('');
      setPrice('');
      setImageUrl('');
      setPopoverOpen(false);
    } else {
      alert('Veuillez remplir tous les champs correctement.');
    }
  };


  return (
    <div className="sticky bottom-0 z-10 bg-sidebar/80 backdrop-blur-sm">
        <form onSubmit={handleTextSubmit} className="flex items-center px-4 py-3 gap-3">
            <div className="flex w-full flex-1 items-stretch rounded-full h-12 bg-input">
                {isCreator && (
                     <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <div className="flex items-center justify-center pl-4 rounded-l-full">
                                <button type="button" className="flex items-center justify-center p-1.5">
                                    <span className="material-symbols-outlined text-muted-foreground">add_circle</span>
                                </button>
                            </div>
                        </PopoverTrigger>
                         <PopoverContent className="w-80 mb-2">
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
                
                <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-foreground focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-muted-foreground px-2 text-base font-normal leading-normal" 
                    placeholder="Type a message..."
                />

                <div className="flex border-none items-center justify-center pr-2 rounded-r-full">
                    <button type="submit" disabled={!inputValue.trim()} className="min-w-[40px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-primary text-background flex disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        </form>
    </div>
  );
}
