'use client'

import dynamic from 'next/dynamic'
import { vidriera_propuestas } from './contenido'

const Vista = dynamic(() => import('./vista').then((m) => m.Vista), { ssr: false })

export const VistaPropuestas = () => (
  <Vista
    menu={vidriera_propuestas.menu}
    layout={vidriera_propuestas.layout}
    headerNav={{ atrasTexto: 'Inicio', atrasPath: '/' }}
    titulo="ESDE - Propuestas"
  />
)
