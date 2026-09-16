import * as React from 'react'

import * as d3 from 'd3'
import { defaultTo, find } from 'lodash'
import { TextoSinCuerpo } from '@/lib/tipos'
import { Animacion, CentroType, GenericD3Selection, Menu, NodoVidriera } from './tipos'
import { capitalize, escalar, get_visitados, layout_centros, layout_fuerza, layout_inicial } from './utils'
import { VistaProps } from './vista'

/**
 * Índice de escritos
 */

export const layout_inicial_escritos = (nodos: GenericD3Selection) => layout_centros(nodos, centros_indice)

// Centros para usar en el índice de escritos
export const centros_indice: CentroType[] = [
  { nombre: 'primarios', x: 0, y: 0, color: '#D8EBD8' },
  { nombre: 'atención', x: -1000, y: 400, color: '#B4D6D7' },
  { nombre: 'mecanicidad', x: -1000, y: -400, color: '#F5EDCE' },
  { nombre: 'trabajo', x: 1000, y: -400, color: '#FAE0B8' },
  { nombre: 'presencia', x: 2000, y: 0, color: '#D7CCEA' },
  { nombre: 'mundo', x: 0, y: 800, color: '#CDD6F0' },
  { nombre: 'contemplación', x: -2000, y: 0, color: '#D9C8DE' },
  { nombre: 'verdad', x: 0, y: -800, color: '#D9C8DE' },
  { nombre: 'libertad', x: 1000, y: 400, color: '#DBB6B6' },
].map((c) => ({ ...c, x: c.x * 3, y: c.y * 3 }))

// Etiquetas dibujadas sobre los centros, en su propia capa
export const Etiquetas: React.FC = () => (
  <>
    {centros_indice.map((c) => (
      <g className="cabecera" data-slug={c.nombre} transform={`translate(${c.x}, ${c.y})`} key={c.nombre}>
        <text>{capitalize(c.nombre)}</text>
      </g>
    ))}
  </>
)

// Procesamiento de la información del índice de escritos (resuelto server-side) para mostrarla como nodos
const texto_a_nodo = (entrada: TextoSinCuerpo, visitados: string[]): NodoVidriera => ({
  ...entrada,
  color: defaultTo(find(centros_indice, ['nombre', entrada.fm.serie])?.color, 'gray'),
  titulo: capitalize(entrada.nombre.split('.')[0].split('-').join(' ')),
  pie: entrada.fm.pie ?? '',
  visitado: visitados.includes(entrada.slug),
})

// Menú de escritos, como lista de nodos. Recibe el índice ya resuelto en el servidor
// (ver lib/textos.ts getEscritosIndex) en vez de pedirlo por HTTP como antes.
export const crearMenuEscritos =
  (indice: TextoSinCuerpo[]): Menu =>
  async () =>
    indice.map((entrada) => texto_a_nodo(entrada, get_visitados()))

/**
 * Menú principal, cuatro esferitas
 */
export const menu_principal: Menu = async (navigate) => [
  {
    id: 'escritos',
    titulo: 'Escritos',
    accion: () => {
      if (navigate) navigate('/escritos/')
    },
    color: d3.rgb('#23689b').formatHsl(),
    pie: 'Textos y escritos de ESDE',
  },
  {
    id: 'propuestas',
    titulo: 'Propuestas',
    accion: () => {
      if (navigate) navigate('/propuestas/')
    },
    color: d3.rgb('#939b62').formatHsl(),
    pie: 'Talleres, seminarios, encuentros y charlas',
  },
  {
    id: 'esde',
    titulo: 'El Silencio Donde Escucho',
    accion: () => {
      if (navigate) navigate('/esde/')
    },
    color: d3.rgb('#ffd56b').formatHsl(),
    pie: 'Indentidad, propósito e historia',
  },
]

/**
 * Animación inicial, zoom in desde lejos
 */
export const anim_inicial: Animacion = async (svg, zoom) => {
  zoom.translateTo(svg, 100, 0)
  zoom.scaleTo(svg, 0.2)
  escalar(svg, zoom, 3000, 0.5)
}

/**
 * Animación índice de textos, zoom out desde cerca
 */
export const anim_indice: Animacion = async (svg, zoom) => {
  zoom.translateTo(svg, 0, 0)
  zoom.scaleTo(svg, 0.5)
  escalar(svg, zoom, 3000, 0.08)
}

/**
 * Menú con las propuestas
 */
export const menu_propuestas: Menu = async (navigate) => [
  {
    titulo: 'Integrador de movimiento',
    accion: async () => {
      if (navigate) navigate('/propuestas/integrador-movimiento/')
    },
    color: '#23689b',
    pie: 'Enfoque integrador de la dialéctica Cuerpo-Mente-Espíritu y de la relación entre lo Interno y lo externo',
  },
  {
    titulo: 'Malabareando un no-malabar',
    accion: async () => {
      if (navigate) navigate('/propuestas/malabareando')
    },
    color: '#23689b',
    pie: 'Estancia de Investigación para malabaristas',
  },
  {
    titulo: 'El Silencio Donde Escucho',
    accion: async () => {
      if (navigate) navigate('/propuestas/esde')
    },
    color: '#23689b',
    pie: 'Taller Entrenamiento de Presencia Activa',
  },
  {
    titulo: 'Los movimientos -en la práctica de la presencia- son "Acción"',
    accion: async () => {
      if (navigate) navigate('/propuestas/accion')
    },
    color: '#23689b',
    pie: '"Cada lenguaje, el gesto de una mano, el toque en una cuerda, un pincel que se desliza, el lanzamiento de un objeto, cada uno, es un movimiento. Y un movimiento es también lo que lo generó"',
  },
  {
    titulo: 'Formato Anual Grupal',
    accion: async () => {
      if (navigate) navigate('/propuestas/grupal')
    },
    color: '#939b62',
    pie: 'Este primer modulo abre el trabajo para la investigación y exploración sobre nosotros mismos, a nivel vivencial y conceptual. Las partes que componen lo que somos, cómo funcionan, cuál es nuestra naturaleza esencial y cuál la adquirida, cuál es y de qué consta un Real Trabajo sobre sí mismo sin formas predeterminadas.',
  },
  {
    titulo: 'Formato Personalizado',
    accion: async () => {
      if (navigate) navigate('/propuestas/personalizado')
    },
    color: '#939b62',
    pie: 'Se abre un espacio-tiempo para iniciar un proceso individual de trabajo sobre sí mismo, dando la atención y cuidado precisos',
  },
  {
    titulo: 'Formato Charla Abierta',
    accion: async () => {
      if (navigate) navigate('/propuestas/abierta')
    },
    color: '#939b62',
    pie: 'La misma se propone sin dirección ni recorrido determinado de antemano, sino que se confía en que tome la forma que le corresponda por intermedio de las cuestiones que atraviesen a los asistentes en torno a estos temas',
  },
]

/**
 * Config de la vidriera de escritos. `menu` se resuelve por página con crearMenuEscritos(indice).
 */
export const vidriera_escritos_layout = {
  animacion: anim_indice,
  layout: (nodos: GenericD3Selection) => {
    layout_inicial_escritos(nodos)
    layout_fuerza(nodos)
  },
  Overlay: Etiquetas,
}

/**
 * Setting entero para la vidriera inicial
 */
export const vidriera_inicial: VistaProps = {
  animacion: anim_inicial,
  menu: menu_principal,
  layout: (nodos) => {
    layout_inicial(nodos)
    layout_fuerza(nodos)
  },
}

/**
 * Setting entero para la vidriera de propuestas
 */
export const vidriera_propuestas: VistaProps = {
  animacion: anim_inicial,
  menu: menu_propuestas,
  layout: (nodos) => {
    layout_inicial(nodos)
    layout_fuerza(nodos)
  },
}
