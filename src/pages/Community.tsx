import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, MessageCircle, Heart, Share2 } from 'lucide-react';

const posts = [
  {
    id: 1,
    author: 'Anna L.',
    avatar: '👩‍🌾',
    time: '2 timmar sedan',
    content: 'Min Barnevelder la sitt första dubbelgulor idag! 🎉 Har ni tips på vad som kan orsaka det?',
    likes: 12,
    comments: 5,
  },
  {
    id: 2,
    author: 'Karl S.',
    avatar: '👨‍🌾',
    time: '5 timmar sedan',
    content: 'Testar nytt ekologiskt foder från Lantmannen. Verkar som att hönorna gillar det mer. Ska rapportera om produktionen ökar!',
    likes: 8,
    comments: 3,
  },
  {
    id: 3,
    author: 'Maria G.',
    avatar: '👩‍🌾',
    time: 'Igår',
    content: 'Tips: Häng en kålhuvud i hönshuset under vintern - håller hönorna aktiva och minskar hackning! 🥬🐔',
    likes: 24,
    comments: 7,
  },
];

export default function Community() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Community 🤝</h1>
          <p className="text-muted-foreground mt-1">Dela tips och erfarenheter med andra hönsbönder</p>
        </div>
      </div>

      {/* New post */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
              👤
            </div>
            <div className="flex-1 space-y-3">
              <Input placeholder="Dela något med communityn..." className="h-11" />
              <div className="flex justify-end">
                <Button size="sm" className="active:scale-95 transition-transform">Publicera</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="bg-card border-border hover:border-surface-highlight transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {post.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">{post.time}</p>
                </div>
              </div>

              <p className="text-sm text-foreground leading-relaxed mb-4">
                {post.content}
              </p>

              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Heart className="h-4 w-4" />
                  {post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
