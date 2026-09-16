import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { cache } from 'react'
import { ResultadoDeBusqueda, Texto, TextoSinCuerpo } from './tipos'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'textos')

export type Base = 'escritos' | 'propuestas' | 'esde'

const capitalize = (s: string) => s.substring(0, 1).toUpperCase() + s.substring(1)

const extraerImagenes = (cuerpoMd: string): string[] => {
  const imgs: string[] = []
  const regex = /!\[(.+?)\]\((.+?)\)/gi
  let m: RegExpExecArray | null
  while ((m = regex.exec(cuerpoMd)) !== null) {
    imgs.push(m[2])
  }
  return imgs
}

const listarMd = (baseDir: string): string[] => {
  const archivos: string[] = []
  for (const entrada of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (entrada.name === '.DS_Store') continue
    const ruta = path.join(baseDir, entrada.name)
    if (entrada.isDirectory()) archivos.push(...listarMd(ruta))
    else if (entrada.name.endsWith('.md')) archivos.push(ruta)
  }
  return archivos
}

// Lee y parsea todos los .md de content/textos. Cacheado por request/build.
export const getAllTextos = cache((): Texto[] => {
  return listarMd(CONTENT_DIR).map((rutaAbsoluta) => {
    const raw = fs.readFileSync(rutaAbsoluta, 'utf8')
    const { data, content } = matter(raw)
    const nombre = path.basename(rutaAbsoluta, '.md')

    return {
      ruta: path.relative(CONTENT_DIR, rutaAbsoluta).split(path.sep).join('/'),
      slug: nombre,
      nombre,
      cuerpo: content.trim(),
      fm: data as Record<string, string>,
      imagenes: extraerImagenes(content),
    }
  })
})

const estaOculto = (t: Texto) => !!(t.fm.oculto && t.fm.oculto !== 'no')

const aSinCuerpo = (t: Texto): TextoSinCuerpo => ({
  titulo: capitalize(t.nombre.replace(/-/g, ' ')),
  link: `/${t.ruta}`,
  nombre: t.nombre,
  fm: t.fm,
  slug: t.slug,
  imagenes: t.imagenes,
})

// Índice público de escritos (usado por la vidriera de /escritos)
export const getEscritosIndex = cache((): TextoSinCuerpo[] =>
  getAllTextos()
    .filter((t) => t.ruta.startsWith('escritos/') && !estaOculto(t))
    .map(aSinCuerpo)
)

export const getSlugsDe = (base: Base): string[] =>
  getAllTextos()
    .filter((t) => t.ruta.startsWith(`${base}/`))
    .map((t) => t.slug)

export const getTextoPorSlug = (base: Base, slug: string): Texto | undefined =>
  getAllTextos().find((t) => t.ruta.startsWith(`${base}/`) && t.slug === slug)

// Búsqueda full-text simple, como la original
export const buscarTextos = (consulta: string): ResultadoDeBusqueda[] => {
  const delta = 50

  return getAllTextos()
    .map((t) => {
      const regex = new RegExp(consulta, 'ig')
      const matches: string[] = []
      const l = t.cuerpo.length
      let m: RegExpExecArray | null
      while ((m = regex.exec(t.cuerpo)) !== null) {
        const inf = regex.lastIndex - delta
        const sup = regex.lastIndex + delta
        const i = Math.max(inf, 0)
        const j = Math.min(sup, l)
        matches.push((inf !== 0 ? '...' : '') + t.cuerpo.slice(i, j) + (sup !== l ? '...' : ''))
      }
      return { titulo: capitalize(t.nombre.replace(/-/g, ' ')), matches, id: t.nombre }
    })
    .filter((r) => r.matches.length > 0)
}
