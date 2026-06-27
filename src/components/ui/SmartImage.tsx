import { useState, type ImgHTMLAttributes } from 'react'
import { PLACEHOLDER_IMAGE } from '@/data/seed'

type SmartImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
}

/** <img> que cai num placeholder com a marca caso a foto não carregue. */
export function SmartImage({ src, alt, ...rest }: SmartImageProps) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={failed ? PLACEHOLDER_IMAGE : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}
