import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Image as ImageIcon, Video, FileText } from 'lucide-react';
import type { UserProfile, Content } from '@/lib/chat-data';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const tierColors = {
  Bronze: 'bg-orange-900/80 border-orange-700/50 text-orange-300',
  Silver: 'bg-slate-500/80 border-slate-400/50 text-slate-100',
  Gold: 'bg-primary/80 border-primary/50 text-primary-foreground',
};


export function ContentCard({ content }: { content: Content & { creator: UserProfile } }) {
  const getIcon = () => {
    switch (content.type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'image':
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  return (
    <Card className="group overflow-hidden relative border-border/50 hover:border-primary/50 transition-colors duration-300">
        <Link href={`/creators/${content.creator.id}`}>
            <div className="relative">
                <Image
                    src={content.imageUrl}
                    alt={content.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-auto aspect-[3/2] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>
            <div className="absolute top-3 right-3">
                <Badge variant="secondary" className={`border ${tierColors[content.tier]}`}>
                <Lock className="h-3 w-3 mr-1.5" />
                {content.tier}
                </Badge>
            </div>
            <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                <div className="flex items-center gap-2 mb-2">
                    <Avatar className='h-8 w-8 border-2 border-background'>
                        <AvatarImage src={content.creator.photoURL} />
                        <AvatarFallback>{content.creator.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">{content.creator.displayName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-white/80 group-hover:text-primary transition-colors">{getIcon()}</div>
                    <h3 className="font-semibold text-lg leading-tight truncate">{content.title}</h3>
                </div>
            </div>
      </Link>
    </Card>
  );
}
