'use client'

/**
 * La vidriera funciona cargando y descargando contenido, pero permaneciendo siempre renderizada.
 * Este contexto se encarga de inicializar y mantener referencia a los elementos de d3.
 */

import * as d3 from 'd3'
import * as React from 'react'
import { createContext, useState } from 'react'
import { centros_indice } from './contenido'
import { Animacion, Layout, NodoVidriera, SVG, Zoom } from './tipos'
import { dragd3, zoomd3 } from './utils'

interface VidrieraConfig {
  nodos: NodoVidriera[]
  layout?: Layout
  animacion?: Animacion
}

function useVidrieraState() {
  const zoomRef = React.useRef<Zoom | null>(null)
  const svgRef = React.useRef<SVG | null>(null)

  const [nodos, setNodos] = useState<NodoVidriera[]>([])
  const [enfocado, setEnfocado] = useState<string | null>(null)

  const layoutRef = React.useRef<Layout | null>(null)
  const animacionRef = React.useRef<Animacion | null>(null)

  const [montado, setMontado] = useState(false)

  const enfocarPunto = React.useCallback(
    (punto: { x?: number; y?: number }, escala: number = 0.8, duracion: number = 500) => {
      if (!svgRef.current || !zoomRef.current) return

      const svgWidth = parseInt(svgRef.current.style('width'))
      const svgHeight = parseInt(svgRef.current.style('height'))
      const { x, y } = punto

      if (x === undefined || y === undefined) return

      const t = d3.zoomIdentity
        .translate(svgWidth / 2, svgHeight / 2)
        .scale(escala)
        .translate(-x, -y)

      svgRef.current.transition().duration(duracion).ease(d3.easeCubic).call(zoomRef.current.transform, t)
    },
    []
  )

  /**
   * El punto (x,y) de un nodo es el centro de su círculo, pero el contenido (texto, cta)
   * se extiende hacia un lado. Medimos con getBBox() lo que realmente está dibujado
   * (círculo + texto, sea cual sea su ancho) para centrar la cámara en el medio de todo eso,
   * no solo en el círculo — así no queda texto cortado en pantallas chicas.
   */
  const centroVisual = React.useCallback((nodo: { x?: number; y?: number }, selector: string) => {
    const elemento = d3.select<SVGGraphicsElement, unknown>(selector).node()
    if (!elemento || nodo.x === undefined || nodo.y === undefined) return nodo

    const caja = elemento.getBBox()
    return {
      x: nodo.x + caja.x + caja.width / 2,
      y: nodo.y + caja.y + caja.height / 2,
    }
  }, [])

  /**
   * Busca por slug el nodo o centro, y enfoca si lo encuentra.
   */
  const enfocarItem = React.useCallback(
    (slug: string, escala: number = 0.8, duracion: number = 1500) => {
      const nodo = nodos.find((n) => n.titulo === slug)
      const centro = centros_indice.find((c) => c.nombre === slug)

      if (centro || nodo) enfocarPunto(centro || nodo!, escala, duracion)
    },
    [nodos, enfocarPunto]
  )

  // Highlight y downlight de nodo enfocado (y su serie si aplica)
  React.useEffect(() => {
    if (enfocado) {
      const nodo = nodos.find((n) => n.slug === enfocado)
      const centro = centros_indice.find((c) => c.nombre === nodo?.fm?.serie)

      if (centro) {
        d3.selectAll('.cabecera').classed('dimmeado', true)
        d3.select(`[data-slug="${centro.nombre}"]`).classed('destacado', true)
      }

      if (nodo) {
        d3.selectAll('.entrada').classed('dimmeado', true)
        enfocarPunto(centroVisual(nodo, `[data-slug="${enfocado}"]`), 0.9, 2500)
      }
    } else {
      d3.selectAll('.cabecera').classed('destacado', false)
      d3.selectAll('.cabecera').classed('dimmeado', false)
      d3.selectAll('.entrada').classed('dimmeado', false)
    }
  }, [enfocado])

  const montar = React.useCallback((config: VidrieraConfig) => {
    if (config.layout) layoutRef.current = config.layout
    if (config.animacion) animacionRef.current = config.animacion

    setNodos(config.nodos)
  }, [])

  /**
   * Cuando los nodos estén, lanzamos d3 (layout y animación)
   * Effectful. Monta el zoom y drag con d3 sobre los nodos que hayan en el estado.
   * Llama al layout y a la animación si las hubiera.
   * Los nodos son renderizados en el template y linkeados a d3 acá.
   * DA POR HECHO QUE EXISTE UN SVG EN EL DOM MONTADO POR VIDRIERA.
   * Corre en un useLayoutEffect para que corra antes del paint pero después del state update de `nodos`.
   */
  React.useLayoutEffect(() => {
    if (nodos.length === 0) return

    const svg = d3.select<SVGSVGElement, unknown>('svg')
    if (svg.empty()) return

    const lienzo = d3.select('.lienzo')
    const zoomBehavior = zoomd3(svg, lienzo)
    dragd3(svg)

    const entradas = d3.selectAll('.entrada').data(nodos)

    if (layoutRef.current) {
      layoutRef.current(entradas)
    }

    if (animacionRef.current) {
      animacionRef.current(svg, zoomBehavior)
    }

    svgRef.current = svg
    zoomRef.current = zoomBehavior
    setMontado(true)
  }, [nodos])

  return {
    nodos,
    setNodos,

    enfocado,
    setEnfocado,

    zoomRef,
    svgRef,
    layoutRef,
    animacionRef,

    montado,

    enfocarItem,
    montar,
  }
}

//@ts-expect-error null default hasta que el provider lo inicialice
const VidrieraContext = createContext<ReturnType<typeof useVidrieraState>>(null)

export const VidrieraContextProvider = ({ children }: React.PropsWithChildren) => {
  const data = useVidrieraState()
  return <VidrieraContext.Provider value={data}>{children}</VidrieraContext.Provider>
}

export function useVidriera() {
  const context = React.useContext(VidrieraContext)
  if (!context) {
    throw new Error('useVidriera debe usarse dentro de un VidrieraContextProvider')
  }
  return context
}

export default VidrieraContext
