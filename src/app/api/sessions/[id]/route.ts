import { supabaseAdmin } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { status, duration_seconds } = await request.json()

  if (!status) {
    return Response.json({ error: 'status is required' }, { status: 400 })
  }

  const update: {
    status: string
    completed_at?: string
    duration_seconds?: number
  } = { status }
  if (status === 'completed' || status === 'abandoned') {
    update.completed_at = new Date().toISOString()
  }
  if (typeof duration_seconds === 'number') {
    update.duration_seconds = duration_seconds
  }

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data)
}
