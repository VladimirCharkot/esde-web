// Representa una entrada del blog leída de disco, con su front matter parseado
export interface Texto {
  ruta: string
  slug: string
  nombre: string
  cuerpo: string
  fm: Record<string, string>
  imagenes: string[]
}

// Representa una _entrada_ del blog como se manda a la vidriera (sin el cuerpo)
export interface TextoSinCuerpo {
  titulo: string
  link: string
  nombre: string
  fm: Record<string, string>
  slug: string
  imagenes?: string[]
}

export interface ResultadoDeBusqueda {
  titulo: string
  matches: string[]
  id: string
}
