'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { debounce } from 'lodash'
import { ResultadoDeBusqueda } from '@/lib/tipos'

type Resultados = ResultadoDeBusqueda[]
type SetState<T> = React.Dispatch<React.SetStateAction<T>>

const query = async (busqueda: string, setResultado: SetState<Resultados | undefined>) => {
  const r = await fetch(`/api/buscar/${busqueda}`)
  if (r.ok) setResultado(await r.json())
}

const debouncedQuery = debounce(query, 1000)

export interface CabeceraProps {
  active?: boolean
  atrasTexto?: string
  atrasPath?: string
}

export const Barra = ({ active, atrasTexto, atrasPath }: CabeceraProps) => {
  const [hovereado, setHovereado] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [resultado, setResultado] = useState<Resultados>()

  useEffect(() => {
    if (busqueda.length > 3) {
      debouncedQuery(busqueda, setResultado)
    } else {
      setResultado(undefined)
    }
  }, [busqueda])

  return (
    <>
      <header
        className={`${resultado ? 'resultados' : ''} ${hovereado || active ? 'hovereado' : ''}`}
        onMouseEnter={() => setHovereado(true)}
        onMouseLeave={() => setHovereado(false)}
      >
        {atrasTexto && atrasPath && <Nav atrasTexto={atrasTexto} atrasPath={atrasPath} />}
        {(!atrasTexto || !atrasPath) && <div className="placeholder" />}

        <Titulo />

        <Busqueda busqueda={busqueda} setBusqueda={setBusqueda} />
      </header>

      {resultado && <ResultadosDeBusqueda resultados={resultado} />}
    </>
  )
}

const Titulo = () => (
  <h1>
    <a href="/" title="El Silencio Donde Escucho" rel="home">
      El Silencio Donde Escucho
    </a>
  </h1>
)

const Nav = ({ atrasTexto, atrasPath }: { atrasTexto?: string; atrasPath?: string }) => {
  const router = useRouter()

  return (
    <nav
      onClick={() => {
        if (atrasPath) router.push(atrasPath)
      }}
    >
      &lt; <span className="texto-volver">{atrasTexto ?? ''}</span>
    </nav>
  )
}

const Busqueda = ({
  busqueda,
  setBusqueda,
}: {
  busqueda: string
  setBusqueda: SetState<string>
}) => (
  <div id="area_busqueda">
    <input
      id="busqueda"
      value={busqueda}
      placeholder="Búsqueda"
      onKeyUp={(e) => {
        if (e.key === 'Escape') setBusqueda('')
      }}
      onChange={(e) => setBusqueda(e.target.value)}
      type="text"
    />
  </div>
)

const TituloResultadoDeBusqueda = ({ r }: { r: ResultadoDeBusqueda }) => (
  <div>
    <h4>{r.titulo.replace('.md', '')}</h4>
  </div>
)

const TextoResultadoDeBusqueda = ({ texto }: { texto: string }) => <p>{texto}</p>

const ResultadosDeBusqueda = ({ resultados }: { resultados: Resultados }) => (
  <div id="resultados">
    {resultados.map((r) => (
      <a className="resultado" key={r.id} href={`/escritos/${r.id}`}>
        <TituloResultadoDeBusqueda r={r} />
        {r.matches.map((m, i) => (
          <TextoResultadoDeBusqueda key={i} texto={m} />
        ))}
      </a>
    ))}
  </div>
)
