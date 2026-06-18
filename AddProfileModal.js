import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AddProfileModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Name is required.')
    setLoading(true)
    setError(null)

    let photo_url = null

    if (photo) {
      const ext = photo.name.split('.').pop()
      const filename = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filename, photo, { upsert: true })

      if (uploadError) {
        setError('Photo upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filename)
      photo_url = urlData.publicUrl
    }

    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert({ name: name.trim(), description: description.trim(), photo_url })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    onCreated(data)
    onClose()
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: '#111111',
        border: '0.5px solid #2a2a2a',
        borderRadius: 16,
        padding: 28,
        width: '100%',
        maxWidth: 440,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: '#ffffff' }}>Add to hitlist</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', color: '#888', fontSize: 20, lineHeight: 1 }}
          >×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#1a1a1a', border: '1.5px dashed #3a3a3a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {preview
                  ? <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 22, color: '#444' }}>+</span>
                }
              </div>
            </label>
            <span style={{ fontSize: 13, color: '#555' }}>Upload photo (optional)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              style={{
                background: '#1a1a1a', border: '0.5px solid #2a2a2a',
                borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 15,
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Who are they</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Relationship, context, why they're on here..."
              rows={3}
              style={{
                background: '#1a1a1a', border: '0.5px solid #2a2a2a',
                borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14,
                resize: 'vertical', width: '100%', lineHeight: 1.6,
              }}
            />
          </div>

          {error && <p style={{ color: '#e02020', fontSize: 13 }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: '#e02020', color: '#fff', border: 'none',
              borderRadius: 8, padding: '12px 0', fontSize: 15, fontWeight: 500,
              opacity: loading ? 0.6 : 1, marginTop: 4,
            }}
          >
            {loading ? 'Adding...' : 'Add to hitlist'}
          </button>
        </div>
      </div>
    </div>
  )
}
