'use client'

import { memo, useState } from 'react'

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
      <img
        src="/assets/img/main/black_ribbon_bottom_right.png"
        alt="Black Ribbon"
        loading="eager"
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
        onError={(e) => {
          console.error('Black ribbon image failed to load')
          setImageError(true)
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
        onLoad={() => {
          console.log('Black ribbon image loaded successfully')
        }}
      />
    </div>
  )
})

BlackRibbon.displayName = 'BlackRibbon'

export default BlackRibbon

