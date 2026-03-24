'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const slides = [
  {
    title: "Everyday Essentials",
    subtitle: "Smart picks for the home, kitchen, and daily routine",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=600&fit=crop",
    cta: "Shop Essentials"
  },
  {
    title: "Freshen Up Your Space",
    subtitle: "Functional home goods that make everyday living easier",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=600&fit=crop",
    cta: "Shop Home Goods"
  },
  {
    title: "Made For Daily Life",
    subtitle: "Practical products for busy mornings, clean spaces, and better routines",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&h=600&fit=crop",
    cta: "Shop New Arrivals"
  }
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-64 md:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="relative h-full flex items-center justify-center text-center text-white">
              <div className="max-w-2xl px-4">
                <h1 className="text-3xl md:text-6xl font-bold mb-2 md:mb-4">{slide.title}</h1>
                <p className="text-lg md:text-2xl mb-4 md:mb-8">{slide.subtitle}</p>
                <button className="btn-primary text-base md:text-lg px-6 py-2 md:px-8 md:py-4">
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}
