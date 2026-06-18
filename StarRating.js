import { useState } from 'react'

export default function StarRating({ value, onChange, readonly = false, size = 18 }) {
  const [hover, setHover] = useState(0)

  const getColor = (star, active) => {
    if (!active) return '#2a2a2a'
    return star <= 3 ? '#22c55e' : '#e02020'
  }

  const active = hover || value

  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5, 6].map((star) => {
        const filled = star <= active
        return (
          <span
            key={star}
            onClick={() => !readonly && onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            style={{
              fontSize: size,
              cursor: readonly ? 'default' : 'pointer',
              color: getColor(star, filled),
              transition: 'color 0.1s',
              userSelect: 'none',
              marginLeft: star === 4 ? 6 : 0,
            }}
          >
            ★
          </span>
        )
      })}
    </div>
  )
}
