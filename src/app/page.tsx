import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/homepage.jpg"
          alt="Professional law office"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {/* Law Firm Name */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-wide leading-tight">
            <span className="block">Dewey,</span>
            <span className="block">Cheatham</span>
            <span className="block">&</span>
            <span className="block">Howe</span>
          </h1>
          <div className="mt-6 text-xl md:text-2xl font-light tracking-wider opacity-90">
            <p>Attorneys at Law</p>
            <div className="w-24 h-px bg-white/60 mx-auto mt-4"></div>
            <p className="mt-4 text-lg">Smart Office Management System</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button 
              size="lg" 
              className="w-48 bg-white text-black hover:bg-gray-100 transition-all duration-200 font-semibold px-8 py-3 text-lg"
            >
              Create Account
            </Button>
          </Link>
          <Link href="/login">
            <Button 
              size="lg"
              className="w-48 bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-200 font-semibold px-8 py-3 text-lg"
            >
              Login
            </Button>
          </Link>
        </div>

        {/* Professional Footer */}
        <div className="mt-16 text-xs opacity-60">
          <p>Est. 1985 • Serving Enterprise Clients Worldwide</p>
        </div>
      </div>
    </div>
  )
}