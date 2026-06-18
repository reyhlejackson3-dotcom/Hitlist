import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/Avatar'
import StarRating from '../../components/StarRating'

export default function ProfilePage() {
  const router = useRouter()
  const { id } = router.query

  const [profile, setProfile] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [logText, setLogText] = useState('')
  const [stars, setStars] = useState(3)
  const [posting, setPosting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showDeleteProfile, setShowDeleteProfile] = useState(false)
  const fileRef = useRef()

  const fetchData = async () => {
    if (!id) return
    const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single()
    const { data: l } = await supabase.from('logs').select('*').eq('profile_id', id).order('created_at', { ascending: false })
    setProfile(p)
    setLogs(l || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const avgStars = logs.length
    ? logs.reduce((s, l) => s + l.stars, 0) / logs.length
    : 0

  const starLabel = (s) => {
    if (s <= 1) return { text: 'Pure motivation', color: '#22c55e' }
    if (s <= 2) return { text: 'Good energy', color: '#22c55e' }
    if (s <= 3) return { text: 'Slightly good', color: '#86efac' }
    if (s <= 4) return { text: 'Slightly bad', color: '#fca5a5' }
    if (s <= 5) return { text: 'Pissed off', color: '#e02020' }
    return { text: 'Pure rage', color: '#e02020' }
  }

  const handlePost = async () => {
    if (!logText.trim()) return
    setPosting(true)
    const { data, error } = await supabase
      .from('logs')
      .insert({ profile_id: id, content: logText.trim(), stars })
      .select()
      .single()
    if (!error) {
      setLogs([data, ...logs])
      setLogText('')
      setStars(3)
    }
    setPosting(false)
  }

  const handleDeleteLog = async (logId) => {
    setDeleting(logId)
    await supabase.from('logs').delete().eq('id', logId)
    setLogs(logs.filter((l) => l.id !== logId))
    setDeleting(null)
  }

  const handleDeleteProfile = async () => {
    await supabase.from('profiles').delete().eq('id', id)
    router.push('/')
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const filename = `${id}-${Date.now()}.${ext}`
    await supabase.storage.from('avatars').upload(filename, file, { upsert: true })
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filename)
    await supabase.from('profiles').update({ photo_url: urlData.publicUrl }).eq('id', id)
    setProfile({ ...profile, photo_url: urlData.publicUrl })
    setUploadingPhoto(false)
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#333', fontSize: 14 }}>Loading...</p>
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#333', fontSize: 14 }}>Profile not found.</p>
    </div>
  )

  const avgLabel = starLabel(avgStars)
  const currentLabel = starLabel(stars)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        <div style={{ padding: '24px 0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'none', color: '#555', fontSize: 22, padding: 0, lineHeight: 1 }}
          >←</button>
          <span style={{ fontSize: 14, color: '#444' }}>Hitlist</span>
        </div>

        <div style={{
          background: '#111', border: '0.5px solid #2a2a2a', borderRadius: 16,
          padding: 24, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <label style={{ cursor: 'pointer' }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              <div style={{ position: 'relative' }}>
                <Avatar src={profile.photo_url} name={profile.name} size={72} />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#1a1a1a', border: '1px solid #3a3a3a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#888',
                }}>
                  {uploadingPhoto ? '…' : '✎'}
                </div>
              </div>
            </label>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>{profile.name}</h1>
              {profile.description && (
                <p style={{ fontSize: 14, color: '#555', marginTop: 6, lineHeight: 1.6 }}>{profile.description}</p>
              )}
              {logs.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <StarRating value={Math.round(avgStars)} readonly size={14} />
                  <span style={{ fontSize: 13, color: avgLabel.color }}>{avgLabel.text}</span>
                  <span style={{ fontSize: 13, color: '#444' }}>· {avgStars.toFixed(1)} avg · {logs.length} log{logs.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDeleteProfile(true)}
              style={{ background: 'none', color: '#333', fontSize: 13, padding: '4px 8px', border: '0.5px solid #2a2a2a', borderRadius: 6 }}
            >
              Delete
            </button>
          </div>
        </div>

        <div style={{
          background: '#111', border: '0.5px solid #2a2a2a', borderRadius: 16,
          padding: 20, marginBottom: 24,
        }}>
          <textarea
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="Log what they did..."
            rows={3}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              color: '#fff', fontSize: 15, resize: 'none', lineHeight: 1.6,
            }}
          />
          <div style={{ borderTop: '0.5px solid #1a1a1a', paddingTop: 14, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <StarRating value={stars} onChange={setStars} size={20} />
              <span style={{ fontSize: 13, color: currentLabel.color }}>{currentLabel.text}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 11, color: '#22c55e' }}>1–3 good</span>
                <span style={{ fontSize: 11, color: '#e02020' }}>4–6 bad</span>
              </div>
              <button
                onClick={handlePost}
                disabled={posting || !logText.trim()}
                style={{
                  background: logText.trim() ? '#e02020' : '#1a1a1a',
                  color: logText.trim() ? '#fff' : '#333',
                  border: 'none', borderRadius: 8,
                  padding: '8px 20px', fontSize: 14, fontWeight: 500,
                  transition: 'background 0.15s',
                }}
              >
                {posting ? 'Logging...' : 'Log it'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {logs.length === 0 && (
            <p style={{ color: '#333', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No logs yet. Start the receipts.</p>
          )}
          {logs.map((log) => {
            const label = starLabel(log.stars)
            return (
              <div
                key={log.id}
                style={{
                  background: '#111', border: '0.5px solid #1a1a1a',
                  borderRadius: 12, padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <p style={{ fontSize: 15, color: '#ddd', lineHeight: 1.65, flex: 1 }}>{log.content}</p>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    style={{ background: 'none', color: '#2a2a2a', fontSize: 16, padding: 0, flexShrink: 0, transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#e02020'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#2a2a2a'}
                  >
                    {deleting === log.id ? '…' : '×'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <StarRating value={log.stars} readonly size={13} />
                  <span style={{ fontSize: 12, color: label.color }}>{label.text}</span>
                  <span style={{ fontSize: 12, color: '#333' }}>· {formatDate(log.created_at)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ height: 60 }} />
      </div>

      {showDeleteProfile && (
        <div
          onClick={() => setShowDeleteProfile(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#111', border: '0.5px solid #2a2a2a', borderRadius: 16,
              padding: 28, maxWidth: 380, width: '100%', textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 16, color: '#fff', fontWeight: 500 }}>Remove {profile.name}?</p>
            <p style={{ fontSize: 13, color: '#555', marginTop: 8 }}>All logs will be deleted. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowDeleteProfile(false)}
                style={{
                  flex: 1, background: 'none', border: '0.5px solid #2a2a2a',
                  borderRadius: 8, padding: '10px 0', color: '#888', fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                style={{
                  flex: 1, background: '#e02020', border: 'none',
                  borderRadius: 8, padding: '10px 0', color: '#fff', fontSize: 14, fontWeight: 500,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
