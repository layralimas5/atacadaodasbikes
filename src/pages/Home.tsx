import { Hero } from '@/components/home/Hero'
import { Marquee } from '@/components/home/Marquee'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Benefits } from '@/components/home/Benefits'
import { Contact } from '@/components/home/Contact'

export function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <FeaturedProducts />
      <Benefits />
      <Contact />
    </>
  )
}
