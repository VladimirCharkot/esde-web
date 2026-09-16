import { NextResponse } from 'next/server'
import { buscarTextos } from '@/lib/textos'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ consulta: string }> }
) {
  const { consulta } = await params

  if (consulta.length < 4) return NextResponse.json([])

  return NextResponse.json(buscarTextos(decodeURIComponent(consulta)))
}
