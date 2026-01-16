import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URI || 'https://backend-lvlw.onrender.com'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${BACKEND_URL}/api/v1/${path}${searchParams ? `?${searchParams}` : ''}`

    console.log(`[Proxy] ${method} ${url}`)

    // Get request body if present
    let body = undefined
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text()
      } catch (e) {
        // No body
      }
    }

    // Forward the request to backend
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies from the request
        'Cookie': request.headers.get('cookie') || '',
      },
      body: body ? body : undefined,
      credentials: 'include',
    })

    // Get response body
    const data = await response.text()
    
    console.log(`[Proxy] Response: ${response.status}`, data ? `(${data.length} bytes)` : '(empty)')
    
    // Create Next.js response with all headers from backend
    const nextResponse = new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })

    // Forward all set-cookie headers from backend
    // Multiple cookies can be set, so we need to handle them properly
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        nextResponse.headers.append('Set-Cookie', value)
      }
    })
    
    return nextResponse
  } catch (error) {
    console.error('[Proxy] Error:', error)
    return NextResponse.json(
      { 
        code: 500, 
        message: 'Proxy error', 
        data: null,
        error: { name: 'ProxyError', details: error instanceof Error ? error.message : 'Unknown error' }
      },
      { status: 500 }
    )
  }
}
