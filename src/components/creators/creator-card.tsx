import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Creator } from '@/lib/data';

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link href={`/creators/${creator.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="relative h-40 w-full">
            <Image
              src={creator.banner.imageUrl}
              alt={`${creator.name}'s banner`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={creator.banner.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="p-4 pt-0 -mt-10 relative z-10 flex items-end gap-4">
             <Avatar className="h-20 w-20 border-4 border-card group-hover:border-primary transition-colors">
              <AvatarImage src={creator.avatar.imageUrl} alt={creator.name} data-ai-hint={creator.avatar.imageHint} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-headline text-xl font-bold">{creator.name}</h3>
              <p className="text-sm text-muted-foreground">{creator.category}</p>
            </div>
          </div>
          <div className="px-4 pb-4">
             <p className="text-sm text-foreground/80 h-10">{creator.bio}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
