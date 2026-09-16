import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Escrito } from '@/components/escrito'
import { renderTexto } from '@/lib/markdown'
import { getSlugsDe, getTextoPorSlug } from '@/lib/textos'

export function generateStaticParams() {
  return getSlugsDe('escritos').map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const texto = getTextoPorSlug('escritos', slug)
  return { title: texto?.fm.titulo ?? 'El Silencio Donde Escucho' }
}

export default async function EscritoDeEscritosPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const texto = getTextoPorSlug('escritos', slug)
  if (!texto) notFound()

  return <Escrito slug={slug} html={renderTexto(texto.cuerpo)} headerNav={{ texto: 'Escritos', path: '/escritos/' }} />
}
