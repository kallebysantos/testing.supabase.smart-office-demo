import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // For demo mode, we'll handle auth client-side only
  // This middleware just allows everything through
  return NextResponse.next()
}