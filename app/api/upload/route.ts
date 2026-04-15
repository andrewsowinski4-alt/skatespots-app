import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateImageMagicBytes } from '@/lib/upload-validation'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const magicOk = await validateImageMagicBytes(file)
    if (!magicOk) {
      return NextResponse.json(
        {
          error:
            'File content is not a valid JPEG, PNG, or WebP image. Choose a different file.',
        },
        { status: 400 }
      )
    }

    // Optional folder: "avatars" (profile photos) vs default "spots" (spot submissions)
    const folderField = formData.get('folder')
    const prefix =
      typeof folderField === 'string' && folderField === 'avatars'
        ? 'avatars'
        : 'spots'

    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${prefix}/${user.id}/${timestamp}.${extension}`

    const blob = await put(filename, file, {
      access: 'private',
    })

    return NextResponse.json({ pathname: blob.pathname })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
