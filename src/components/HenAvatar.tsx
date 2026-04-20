import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Camera, Loader2, X } from 'lucide-react';

interface HenAvatarProps {
  henId: string;
  henType: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  showProfileActions?: boolean;
  className?: string;
}

const SIZES = {
  sm: 'w-9 h-9 text-lg',
  md: 'w-11 h-11 text-2xl',
  lg: 'w-20 h-20 text-4xl',
};

const ICON_SIZES = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

/**
 * Compress and resize an image to a 256x256 square before upload.
 * Uses canvas to crop center & convert to webp (smaller than jpeg).
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      const TARGET = 256; // small avatar size
      const canvas = document.createElement('canvas');
      canvas.width = TARGET;
      canvas.height = TARGET;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));

      // Center-crop square
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;

      ctx.drawImage(img, sx, sy, min, min, 0, 0, TARGET, TARGET);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          resolve(blob);
        },
        'image/webp',
        0.82,
      );
    };
    img.onerror = () => reject(new Error('Could not load image'));
    reader.readAsDataURL(file);
  });
}

export default function HenAvatar({
  henId,
  henType,
  imageUrl,
  size = 'md',
  editable = false,
  showProfileActions = false,
  className = '',
}: HenAvatarProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [displayUrl, setDisplayUrl] = useState(imageUrl || '');

  useEffect(() => {
    setDisplayUrl(imageUrl || '');
  }, [imageUrl]);

  const emoji = henType === 'rooster' ? '🐓' : '🐔';
  const sizeClass = SIZES[size];
  const iconClass = ICON_SIZES[size];
  const openFilePicker = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (!uploading) inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Endast bilder', description: 'Välj en bildfil (jpg, png, webp).', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setDisplayUrl(previewUrl);
    try {
      const blob = await compressImage(file);
      const path = `${user.id}/${henId}.webp`;

      const { error: uploadError } = await supabase.storage
        .from('hen-images')
        .upload(path, blob, {
          contentType: 'image/webp',
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Skapa en signerad URL som gäller 1 år (privat bucket)
      const { data: signedData, error: signedErr } = await supabase.storage
        .from('hen-images')
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signedErr) throw signedErr;
      // Cache-buster så uppdaterad bild visas direkt
      const publicUrl = `${signedData.signedUrl}&v=${Date.now()}`;

      await api.updateHen(henId, { image_url: publicUrl } as any);
      setDisplayUrl(publicUrl);
      queryClient.setQueryData(['hen-profile', henId], (old: any) => old ? { ...old, image_url: publicUrl } : old);
      queryClient.setQueryData(['hens'], (old: any) => Array.isArray(old) ? old.map((hen) => hen.id === henId ? { ...hen, image_url: publicUrl } : hen) : old);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['hens'] }),
        queryClient.invalidateQueries({ queryKey: ['hen-profile', henId] }),
      ]);
      toast({ title: 'Bild uppladdad! 📷' });
    } catch (err: any) {
      setDisplayUrl(imageUrl || '');
      toast({ title: 'Uppladdning misslyckades', description: err.message, variant: 'destructive' });
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setUploading(true);
    try {
      const path = `${user.id}/${henId}.webp`;
      await supabase.storage.from('hen-images').remove([path]);
      await api.updateHen(henId, { image_url: null } as any);
      setDisplayUrl('');
      queryClient.invalidateQueries({ queryKey: ['hens'] });
      queryClient.invalidateQueries({ queryKey: ['hen-profile', henId] });
      toast({ title: 'Bild borttagen' });
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const bgClass = henType === 'rooster' ? 'bg-warning/10' : 'bg-accent/10';

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${sizeClass} rounded-xl overflow-hidden flex items-center justify-center ${bgClass} ${editable && showProfileActions ? 'cursor-pointer' : ''}`}
        onClick={editable && showProfileActions ? () => openFilePicker() : undefined}
        onKeyDown={editable && showProfileActions ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') openFilePicker(e);
        } : undefined}
        role={editable && showProfileActions ? 'button' : undefined}
        tabIndex={editable && showProfileActions ? 0 : undefined}
        aria-label={editable && showProfileActions ? (displayUrl ? 'Byt bild' : 'Ladda upp bild') : undefined}
      >
        {displayUrl ? (
          <img
            key={displayUrl}
            src={displayUrl}
            alt="Höna"
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'block';
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{emoji}</span>
        )}
      </div>

      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {!showProfileActions && (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              className={`absolute -bottom-1 -right-1 ${
                size === 'lg' ? 'w-7 h-7' : 'w-5 h-5'
              } rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50`}
                aria-label={displayUrl ? 'Byt bild' : 'Ladda upp bild'}
            >
              {uploading ? (
                <Loader2 className={`${iconClass} animate-spin`} />
              ) : (
                <Camera className={iconClass} />
              )}
            </button>
          )}
          {displayUrl && !uploading && !showProfileActions && (
            <button
              type="button"
              onClick={handleRemove}
              className={`absolute -top-1 -right-1 ${
                size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
              } rounded-full bg-destructive text-destructive-foreground shadow-md flex items-center justify-center hover:bg-destructive/90 transition-colors`}
              aria-label="Ta bort bild"
            >
              <X className={iconClass} />
            </button>
          )}
          {showProfileActions && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                {displayUrl ? 'Byt bild' : 'Lägg till bild'}
              </button>
              {displayUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                  Ta bort
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
