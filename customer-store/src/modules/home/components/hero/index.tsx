import { Button, Heading } from "@medusajs/ui"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[80vh] w-full relative bg-ui-bg-subtle flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero-banner.png"
        alt="Hero background"
        fill
        className="object-cover"
        priority
      />
      {/* Dark Overlay for text legibility */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center items-center text-center px-4 max-w-[800px] gap-8">
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Heading
            level="h1"
            className="text-4xl sm:text-5xl md:text-6xl text-white font-medium tracking-tight drop-shadow-lg"
          >
            Elevate Your Style
          </Heading>
          <Heading
            level="h2"
            className="text-lg sm:text-xl md:text-2xl text-white/90 font-normal drop-shadow-md max-w-[600px] mx-auto"
          >
            Discover our latest collection of premium apparel crafted for the modern individual.
          </Heading>
        </div>

        <LocalizedClientLink href="/store" className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
          <Button variant="primary" className="h-12 px-8 text-base bg-white text-black hover:bg-white/90 border-transparent transition-all">
            Shop the Collection
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero
