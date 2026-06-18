import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'
import StarRating from '../components/StarRating'
import AddProfileModal from '../components/AddProfileModal'
import Podium from '../components/Podium'

export default function Home() {
  const router = useRouter()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchProfiles = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: logData } = await supabase
      .from('logs')
      .select('profile_id, stars')

    const enriched = (profileData || []).map((p) => {
      const pLogs = (logData || []).filter((l) => l.profile_id === p.id)
      const avgStars = pLogs.length
        ? pLogs.reduce((sum, l) => sum + l.stars, 0) / pLogs.length
        : 0
      return { ...p, avgStars, logCount: pLogs.length }
    })

    setProfiles(enriched)
    setLoading(false)
  }

  useEffect(() => { fetchProfiles() }, [])

  const starColor = (avg) => {
    if (avg === 0) return '#444'
    return avg <= 3 ? '#22c55e' : '#e02020'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px' }}>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '32px 0 28px',
          borderBottom: '0.5px solid #1a1a1a',
          marginBottom: 32,
        }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 500, color: '#fff', letterSpacing: -0.5 }}>
              My Hitlist
            </h1>
            <p style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Mark my words.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#e02020', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 500,
            }}
          >
            + Add
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#444', fontSize: 14, textAlign: 'center', paddingTop: 60 }}>Loading...</p>
        ) : profiles.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <p style={{ color: '#333', fontSize: 32 }}>☠</p>
            <p style={{ color: '#444', fontSize: 15, marginTop: 12 }}>Hitlist is empty.</p>
            <p style={{ color: '#333', fontSize: 13, marginTop: 6 }}>Add someone to get started.</p>
          </div>
        ) : (
          <>
            {profiles.some(p => p.logCount > 0) && <Podium profiles={profiles} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => router.push(`/profile/${profile.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px',
                    background: '#111',
                    border: '0.5px solid #1a1a1a',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a2a'
                    e.currentTarget.style.background = '#141414'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1a1a1a'
                    e.currentTarget.style.background = '#111'
                  }}
                >
                  <Avatar src={profile.photo_url} name={profile.name} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 15, color: '#fff' }}>{profile.name}</p>
                    {profile.description && (
                      <p style={{
                        fontSize: 13, color: '#555', marginTop: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {profile.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    {profile.logCount > 0 ? (
                      <>
                        <StarRating value={Math.round(profile.avgStars)} readonly size={13} />
                        <p style={{ fontSize: 11, color: starColor(profile.avgStars) }}>
                          {profile.avgStars.toFixed(1)} · {profile.logCount} log{profile.logCount !== 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: 11, color: '#333' }}>No logs yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{ height: 60 }} />
      </div>

      {showModal && (
        <AddProfileModal
          onClose={() => setShowModal(false)}
          onCreated={() => fetchProfiles()}
        />
      )}
    </div>
  )
}
