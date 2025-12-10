import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Content } from '@/lib/data';
import { Lock, Image as ImageIcon, Video, FileText } from 'lucide-react';

const tierColors = {
  Bronze: 'bg-orange-900/80 border-orange-700/50 text-orange-300',
  Silver: 'bg-slate-500/80 border-slate-400/50 text-slate-100',
  Gold: 'bg-primary/80 border-primary/50 text-primary-foreground',
};


export function ContentCard({ content }: { content: Content }) {
  const getIcon = () => {
    switch (content.type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'image':
      default:
        return <ImageIcon className="h-5 w-5" />;
    }
  };

  return (
    <Card className="group overflow-hidden relative border-border/50 hover:border-primary/50 transition-colors duration-300">
      <Image
        src={content.image.imageUrl}
        alt={content.title}
        width={600}
        height={400}
        className="object-cover w-full h-auto aspect-[3/2] transition-transform duration-300 group-hover:scale-105"
        data-ai-hint={content.image.imageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className={`border ${tierColors[content.tier]}`}>
          <Lock className="h-3 w-3 mr-1.5" />
          {content.tier}
        </Badge>
      </div>
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-white/80 group-hover:text-primary transition-colors">{getIcon()}</div>
          <h3 className="font-semibold text-lg leading-tight">{content.title}</h3>
        </div>
      </div>
    </Card>
  );
}
