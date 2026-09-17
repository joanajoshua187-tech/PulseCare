import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Send, MessageSquare, Video } from 'lucide-react'

export default function Consultation() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const jitsiContainerRef = useRef(null)
  const [tab, setTab] = useState('video')
  const [appointment, setAppointment] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      setUserId(user.id)

      const { data: apptData } = await supabase
        .from('appointments')
        .select('*, providers(full_name, specialty)')
        .eq('id', appointmentId)
        .single()
      setAppointment(apptData)

      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: true })
      setMessages(msgData || [])
    }
    load()
  }, [appointmentId, navigate])

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${appointmentId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `appointment_id=eq.${appointmentId}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [appointmentId])

  useEffect(() => {
    if (tab !== 'video' || !jitsiContainerRef.current) return

    const script = document.createElement('script')
    script.src = 'https://meet.jit.si/external_api.js'
    script.async = true
    script.onload = () => {
      /* global JitsiMeetExternalAPI */
      new JitsiMeetExternalAPI('meet.jit.si', {
        roomName: `pulsecare-consultation-${appointmentId}`,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: 500,
      })
    }
    document.body.appendChild(script)

    return () => { document.body.removeChild(script) }
  }, [tab, appointmentId])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageText = newMessage
    setNewMessage('')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        appointment_id: appointmentId,
        sender_id: userId,
        sender_role: 'patient',
        content: messageText,
      })
      .select()
      .single()

    if (!error && data) {
      setMessages((prev) => [...prev, data])
    }
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/appointments')}
          className="flex items-center gap-1 text-ink/50 hover:text-ink mb-4"
        >
          <ArrowLeft size={18} /> Back to appointments
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-ink/5">
          <div className="p-6 border-b border-ink/5">
            <h1 className="font-serif font-semibold text-ink text-lg">
              Consultation with {appointment?.providers?.full_name || '...'}
            </h1>
            <p className="text-sm text-ink/50">{appointment?.providers?.specialty}</p>
          </div>

          <div className="flex border-b border-ink/5">
            <button
              onClick={() => setTab('video')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
                tab === 'video' ? 'text-teal border-b-2 border-teal' : 'text-ink/40'
              }`}
            >
              <Video size={18} /> Video Call
            </button>
            <button
              onClick={() => setTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
                tab === 'chat' ? 'text-teal border-b-2 border-teal' : 'text-ink/40'
              }`}
            >
              <MessageSquare size={18} /> Chat
            </button>
          </div>

          {tab === 'video' && (
            <div ref={jitsiContainerRef} className="w-full" />
          )}

          {tab === 'chat' && (
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-ink/30 text-sm mt-8">No messages yet.</p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                        msg.sender_id === userId
                          ? 'bg-teal text-white'
                          : 'bg-ink/5 text-ink'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-ink/5 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-coral text-white px-4 rounded-lg hover:bg-coral-dark"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}