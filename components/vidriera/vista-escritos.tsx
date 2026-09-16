'use client'

import dynamic from 'next/dynamic'
import { TextoSinCuerpo } from '@/lib/tipos'
import { crearMenuEscritos, vidriera_escritos_layout } from './contenido'

const Vista = dynamic(() => import('./vista').then((m) => m.Vista), { ssr: false })

export const VistaEscritos = ({ indice }: { indice: TextoSinCuerpo[] }) => (
  <Vista
    animacion={vidriera_escritos_layout.animacion}
    menu={crearMenuEscritos(indice)}
    layout={vidriera_escritos_layout.layout}
    Overlay={vidriera_escritos_layout.Overlay}
    indice
    headerNav={{ atrasTexto: 'Inicio', atrasPath: '/' }}
    titulo="ESDE - Escritos"
  />
)
