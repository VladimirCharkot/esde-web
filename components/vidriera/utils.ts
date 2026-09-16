import * as d3 from 'd3'
import { CentroType, GenericD3Selection, Punto, SVG, Zoom } from './tipos'
import { uniq } from 'lodash'

export const capitalize = (s: string) => s.substring(0, 1).toUpperCase() + s.substring(1)

/**
 * Actualiza la posición de los nodos en el lienzo a partir de las x, y de su datum
 */
export const transform = (nodos: GenericD3Selection) => {
  nodos.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
}

/**
 * Limpia el `.lienzo` de todo
 */
export const limpiar_svg = () => {
  d3.selectAll('.lienzo *').transition().duration(500).style('opacity', 0).remove()
}

/**
 * Envuelve un texto en tspans para que no se salga del ancho, agregando saltos de línea
 */
export const wrap = (text: GenericD3Selection) => {
  // as in https://bl.ocks.org/mbostock/7555321
  const width = 500
  text.each(function (this: SVGTextElement) {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line: string[] = [],
      lineNumber = 0,
      lineHeight = 1.3, // ems
      dy = 1,
      tspan = text
        .text(null as any)
        .append('tspan')
        .attr('dy', dy + 'em')
    while ((word = words.pop())) {
      line.push(word as never)
      tspan.text(line.join(' '))
      if (tspan && tspan.node()!.getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(' '))
        line = [word as never]
        tspan = text
          .append('tspan')
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word)
      }
    }
  })
}

/**
 * Devuelve la lista de los ids de los nodos visitados del localStorage
 */
export const get_visitados = (): string[] => JSON.parse(localStorage.getItem('visitados') ?? '[]')

/**
 * Guarda la lista de los ids de los nodos visitados en el localStorage
 */
export const set_visitados = (visitados: string[]) => localStorage.setItem('visitados', JSON.stringify(visitados))

/**
 * Guarda un texto en el array de visitados en localStorage
 */
export const visitar = (slug: string) => {
  set_visitados(uniq([...get_visitados(), slug]))
}

/**
 * Arregla los nodos alrededor de los centros como pétalos
 */
export const layout_centros = (nodos: GenericD3Selection, centros: CentroType[] | null) => {
  const centrar = (nodos: GenericD3Selection, centro: CentroType) => {
    const theta = Math.PI * (3 - Math.sqrt(5))
    nodos.each((d: any, i: number) => {
      const r = 100 * Math.sqrt(i)
      const phi = i * theta
      d.x = centro.x + r * Math.cos(phi)
      d.y = centro.y + r * Math.sin(phi)
    })
    transform(nodos)
  }

  if (!centros) centros = [{ nombre: '', x: 0, y: 0, color: '#aaa' }]

  centros.forEach((c) => {
    const these_nodos = c.nombre ? nodos.filter((n: any) => n.fm?.serie == c.nombre) : nodos
    centrar(these_nodos, c)
  })
}

/**
 * Layout de pétalos con un solo centro
 */
export const layout_inicial = (ns: GenericD3Selection) =>
  layout_centros(ns, [{ nombre: '', x: 0, y: 0, color: 'black' }])

interface IOpcionesFuerza {
  init: () => void
  draw: () => void
  dv: number
  da: number
  df: number
}

/**
 * Aplica un layout de fuerza a los nodos
 */
export const layout_fuerza = (nodos: GenericD3Selection, custom_opcs: Partial<IOpcionesFuerza> = {}) => {
  const default_opcs: IOpcionesFuerza = {
    init: () => {},
    draw: () => transform(nodos),
    dv: 0.6,
    da: 0.01,
    df: -450,
  }
  const opcs = { ...default_opcs, ...custom_opcs }

  const simulacion = d3
    .forceSimulation(d3.selectAll('.entrada').data() as d3.SimulationNodeDatum[])
    .velocityDecay(opcs.dv)
    .alphaDecay(opcs.da)
    .force('campo', d3.forceManyBody().strength(opcs.df))
    .on('tick', opcs.draw)

  return simulacion
}

export const zoomd3 = (svg: SVG, lienzo: GenericD3Selection) => {
  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.05, 5])
    .on('zoom', ({ transform }) => {
      lienzo.attr('transform', transform)
    })

  svg.call(zoomBehavior)

  return zoomBehavior
}

export const dragd3 = (svg: SVG) => {
  const dragBehavior = d3.drag<SVGSVGElement, unknown>().on('drag', (ev, d: any) => {
    d.x = ev.x
    d.y = ev.y
  })

  svg.call(dragBehavior)

  return dragBehavior
}

/**
 * Escala el svg a un factor, animando en ms milisegundos
 */
export const escalar = (svg: SVG, zoom: Zoom, ms: number, scl: number) =>
  svg.transition().duration(ms).ease(d3.easeCubic).call(zoom.scaleTo, scl)

/**
 * Panea el svg a un punto, animando en ms milisegundos
 */
export const panear = (svg: SVG, zoom: Zoom, ms: number, p: Punto) =>
  svg.transition().duration(ms).ease(d3.easeCubic).call(zoom.translateTo, p.x, p.y)
