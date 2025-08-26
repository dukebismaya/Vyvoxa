import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export function SafeAvatar({ src, fallback, className, ...props }) {
  const hasValidSrc = src && src.trim() && src !== '';
  
  return (
    <Avatar className={className} {...props}>
      {hasValidSrc ? <AvatarImage src={src} alt={fallback} /> : null}
      <AvatarFallback>
        {fallback || 'U'}
      </AvatarFallback>
    </Avatar>
  );
}
