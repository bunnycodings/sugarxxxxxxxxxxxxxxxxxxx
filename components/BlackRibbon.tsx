'use client'

import { memo, useState } from 'react'
import Image from 'next/image'

const BlackRibbon = memo(() => {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return null // Don't render anything if image fails to load
  }

  return (
    <div 
      className="absolute top-0 right-0 z-[9999] pointer-events-none overflow-visible"
      style={{ 
        width: '120px', 
        height: '120px',
        zIndex: 9999,
        position: 'absolute'
      }}
    >
      <Image
        src="/assets/img/main/black_ribbon_bottom_right.png"
        alt="Black Ribbon"
        width={120}
        height={120}
        className="w-full h-auto"
        style={{
          opacity: 0.95,
          pointerEvents: 'none',
          display: 'block',
          maxWidth: '120px',
          height: 'auto'
        }}
        priority
        onError={() => {
          console.error('Black ribbon image failed to load')
          setImageError(true)
        }}
      />
    </div>
  )
})

BlackRibbon.displayName = 'BlackRibbon'

export default BlackRibbon

