'use client'

import dynamic from 'next/dynamic'
import { menu_principal, vidriera_inicial } from './contenido'

// La vidriera es inherentemente client-side (d3 imperativo sobre el DOM,
// localStorage). La cargamos sin SSR para no pagar ese costo en el servidor.
const Vista = dynamic(() => import('./vista').then((m) => m.Vista), { ssr: false })

export const VistaPrincipal = () => (
  <Vista
    animacion={vidriera_inicial.animacion}
    menu={menu_principal}
    layout={vidriera_inicial.layout}
    titulo="El Silencio Donde Escucho"
  />
)
