import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Escrito } from '@/components/escrito'
import { renderTexto } from '@/lib/markdown'
import { getTextoPorSlug } from '@/lib/textos'

export async function generateMetadata(): Promise<Metadata> {
  const texto = getTextoPorSlug('esde', 'hoy')
  return { title: texto?.fm.titulo ?? 'El Silencio Donde Escucho' }
}

export default function EsdePage() {
  const texto = getTextoPorSlug('esde', 'hoy')
  if (!texto) notFound()

  return <Escrito slug="hoy" html={renderTexto(texto.cuerpo)} headerNav={{ texto: 'Inicio', path: '/' }} />
}
