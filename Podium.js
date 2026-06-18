import Avatar from './Avatar'
import StarRating from './StarRating'
import { useRouter } from 'next/router'

function PodiumBlock({ profiles, title, order, color }) {
  const router = useRouter()

  if (profiles.length === 0) return null

  const sorted = order === 'asc'
    ? [...profiles].sort((a, b) => a.avgStars - b.avgStars)
    : [...profiles].sort((a, b) => b.avgStars - a.avgStars)

  const top3 = sorted.slice(0, 3)

  const podiumOrder = top3.length === 1
    ? [top3[0]]
    : top3.length === 2
    ? [top3[1], top3[0]]
    : [top3[1], top3[0], top3[2]]

  const heights = [90, 130, 70]
  const labels = ['2nd', '1st', '3rd']
  const sizes = [48, 64, 44]

  return (
    <div style={{
      flex: 1,
      background: '#111',
      border: `0.5px solid #2a2a2a`,
      borderRadius: 16,
      padding: '24px 16px 0',
      minWidth: 0,
    }}>
      <p style={{
        fontSize: 11, color: color === 'green' ? '#22c55e' : '#e02020',
        textTransform: 'uppercase', letterSpacing: 2,
        marginBottom: 24, textAlign: 'center', fontWeight: 500,
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
        {podiumOrder.map((profile, i) => (
          <div
            key={profile.id}
            onClick={() => router.push(`/profile/${profile.id}`)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1 }}
          >
            <Avatar src={profile.photo_url} name={profile.name} size={sizes[i]} />
            <p style={{
              marginTop: 6, fontSize: 12, fontWeight: 500, color: '#fff',
              textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', width: '100%', padding: '0 2px',
            }}>
              {profile.name}
            </p>
            <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
              {profile.avgStars.toFixed(1)}
            </p>
            <div style={{
              marginTop: 8,
              width: '100%',
              height: heights[i],
              background: color === 'green'
                ? (i === 1 ? '#0a1a0a' : '#0d130d')
                : (i === 1 ? '#1a0000' : '#130a0a'),
              border: `0.5px solid ${color === 'green'
                ? (i === 1 ? '#166534' : '#1a2a1a')
                : (i === 1 ? '#8b1a1a' : '#2a1a1a')}`,
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8,
            }}>
              <span style={{ fontSize: 11, color: color === 'green' ? '#166534' : '#8b1a1a', fontWeight: 500 }}>
                {labels[i]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Podium({ profiles }) {
  const withLogs = profiles.filter(p => p.logCount > 0)
  if (withLogs.length === 0) return null

  const sorted = [...withLogs].sort((a, b) => a.avgStars - b.avgStars)

  const goodCandidates = sorted.slice(0, Math.min(3, sorted.length))
  const badCandidates = sorted.slice(-Math.min(3, sorted.length)).reverse()

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
      <PodiumBlock profiles={goodCandidates} title="Most motivating" order="asc" color="green" />
      <PodiumBlock profiles={badCandidates} title="Most wanted" order="desc" color="red" />
    </div>
  )
}
