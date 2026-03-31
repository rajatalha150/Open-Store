'use client'

import Link from 'next/link'
import { Circle, Crown, Gem, Gift, Grip, Home, Sparkles, Star, Watch } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string | null;
  created_at: string;
}

const FALLBACK_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'

function normalizeCategoryName(name: string) {
  const trimmedName = name.trim().replace(/\s+/g, ' ')
  return trimmedName || 'Category'
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [failedImageIds, setFailedImageIds] = useState<number[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCategories(data.categories.slice(0, 6))
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const getCategoryIcon = (category: Category) => {
    const matchSource = `${category.name} ${category.icon || ''}`.toLowerCase()

    if (matchSource.includes('home') || matchSource.includes('house')) return Home
    if (matchSource.includes('ring')) return Circle
    if (matchSource.includes('necklace') || matchSource.includes('pendant')) return Gem
    if (matchSource.includes('watch') || matchSource.includes('time')) return Watch
    if (matchSource.includes('earring')) return Star
    if (matchSource.includes('bracelet')) return Circle
    if (matchSource.includes('diamond') || matchSource.includes('stone')) return Sparkles
    if (matchSource.includes('gold') || matchSource.includes('silver')) return Crown
    if (matchSource.includes('set') || matchSource.includes('gift')) return Gift
    if (matchSource.includes('school') || matchSource.includes('office')) return Grip

    return Gem
  }

  const markImageAsFailed = (categoryId: number) => {
    setFailedImageIds((prev) => (prev.includes(categoryId) ? prev : [...prev, categoryId]))
  }

  if (loading) {
    return (
      <section className="bg-secondary-900 py-6 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 md:mb-10">
            <div className="h-3 w-28 rounded-full bg-secondary-700" />
            <div className="mt-4 h-8 w-56 rounded-full bg-secondary-700" />
            <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-secondary-800" />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-full overflow-hidden rounded-[24px] border border-secondary-800 bg-secondary-800/90 p-2.5 md:p-3"
              >
                <div className="aspect-square animate-pulse rounded-[18px] bg-secondary-700" />
                <div className="space-y-2.5 px-1 pb-1 pt-3">
                  <div className="h-3 w-20 rounded-full bg-secondary-700" />
                  <div className="h-4 w-4/5 rounded-full bg-secondary-700" />
                  <div className="h-3 w-24 rounded-full bg-secondary-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-secondary-900 py-6 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-300">
              Shop By Category
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-secondary-50 md:text-4xl">
              Explore our featured departments
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-secondary-300 md:text-base">
            Discover everyday essentials, home upgrades, and seasonal favorites in a cleaner, easier-to-scan layout.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category)
            const displayName = normalizeCategoryName(category.name)
            const hasImage = Boolean(category.image_url) && !failedImageIds.includes(category.id)

            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-secondary-700/80 bg-secondary-800 p-2.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/70 hover:shadow-xl hover:shadow-black/20 md:p-3"
              >
                <div className="relative aspect-square overflow-hidden rounded-[18px] bg-gradient-to-br from-cream-100 via-secondary-100 to-secondary-200">
                  {hasImage ? (
                    <img
                      src={category.image_url || FALLBACK_CATEGORY_IMAGE}
                      alt={displayName}
                      className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04] md:p-4"
                      onError={() => markImageAsFailed(category.id)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-lg shadow-secondary-400/30 md:h-20 md:w-20">
                        <IconComponent className="h-7 w-7 text-primary-500 md:h-9 md:w-9" />
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/18 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <h3
                        title={displayName}
                        className="min-h-[2.75rem] text-sm font-semibold leading-tight text-secondary-50"
                      >
                        {displayName}
                      </h3>
                    </div>
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/14 text-primary-300 transition-colors duration-300 group-hover:bg-primary-500/22 group-hover:text-primary-200">
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
