'use client'

import * as d3 from 'd3'
import { chunk } from 'lodash'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useVidriera } from './contexto'
import { NodoVidriera } from './tipos'

export interface NodoProps {
  g: NodoVidriera
}

/**
 * Renderiza un nodo de la vidriera en svg (<g> + <circle> + <text>)
 */
export const Nodo = ({ g }: NodoProps) => {
  const router = useRouter()
  const { enfocado, setEnfocado } = useVidriera()

  if (g.id === undefined) g.id = g.titulo.toLowerCase().split(' ').join('-')

  // Sin slug (esferas de menú, sin índice ni foco global relevante) el hover local manda.
  // Con slug, "resaltado" sigue al `enfocado` global: así el hover en el Índice, el hover
  // sobre el nodo y el doble-tap en mobile terminan todos en el mismo lugar, y enfocar un
  // nodo nuevo automáticamente le quita el resaltado al anterior.
  const [hovereado, setHovereado] = useState(false)
  const resaltado = g.slug ? enfocado === g.slug : hovereado

  // Una vez pedida la imagen la dejamos montada, para que la salida también tenga rampa de opacidad.
  // Se pide ante cualquier vía de resaltado (hover propio, click, o el hover del Índice vía `enfocado`).
  const [imagenPedida, setImagenPedida] = useState(false)
  if (resaltado && !imagenPedida) setImagenPedida(true)
  // Hasta que no resuelve (onLoad) no la mostramos, sino la primera aparición no tiene de dónde partir la transición
  const [imagenResuelta, setImagenResuelta] = useState(false)

  return (
    <g
      data-slug={g.slug}
      onClick={() => {
        // En mobile no hay hover previo al tap: el primer click enfoca (como haría el mouse),
        // recién el segundo (ya enfocado) navega. En desktop el hover ya lo deja enfocado antes
        // del click, así que sigue siendo un solo paso.
        if (!resaltado) {
          setHovereado(true)
          setEnfocado(g.slug || null)
          return
        }

        if (g.accion) g.accion()
        else if (g.slug) router.push(`/escritos/${g.slug!}`)
      }}
      className={`entrada ${resaltado ? 'resaltado' : ''} ${g.visitado ? 'visitado' : ''}`}
      // Pointer Events en vez de Mouse Events: en mobile, un tap dispara un mouseenter
      // sintético justo antes del click (para simular :hover), lo que adelantaría el
      // enfoque y rompería el paso doble. Filtrando por pointerType, el touch no dispara esto.
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        setHovereado(true)
        setEnfocado(g.slug || null)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return
        setHovereado(false)
        setEnfocado(null)
      }}
    >
      {/* Esferita */}
      <circle r={95} fill={g.color} stroke={d3.color(g.color)?.darker().formatHex()}></circle>

      {/* Portada, clipeada al círculo. Se pide una sola vez y su opacidad la maneja el CSS (rampa de entrada/salida) */}
      {imagenPedida && g.imagenes?.[0] && (
        <image
          href={g.imagenes[0]}
          x={-95}
          y={-95}
          width={190}
          height={190}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#nodo-clip)"
          className={imagenResuelta ? 'resuelta' : ''}
          onLoad={() => setImagenResuelta(true)}
        />
      )}

      {/* Titulo */}
      <text className="titulo" transform="translate(-10,-10)">
        {g.titulo}
      </text>

      {/* Parte el pie en renglones de siete palabras: */}
      {chunk(g.pie.split(' '), 7).map((frase, i) => (
        <text key={frase.join('')} className="pie" transform={`translate(20,${20 + 25 * i})`}>
          {frase.join(' ')}
        </text>
      ))}

      {/* Invitación a navegar, se revela junto con el resto al enfocar */}
      {g.slug && !g.accion && (
        <text className="cta" transform="translate(95,70)">
          Click para leer
        </text>
      )}
    </g>
  )
}
