'use client'

import * as React from 'react'
import { useVidriera } from './contexto'
import { Nodo } from './nodo'

export interface VidrieraProps {
  Overlay?: React.FC // Componente que se renderiza sobre los nodos
}

// Una vidriera es: nodos + layout inicial + fuerzas + animacion inicial
// Renderiza los nodos desde react y llama luego a d3 para posicionarlos y delegar animaciones y etc

export const Vidriera = ({ Overlay }: VidrieraProps) => {
  const { nodos } = useVidriera()

  return (
    <svg className="vidriera">
      <defs>
        <clipPath id="nodo-clip">
          <circle r={95} />
        </clipPath>
      </defs>
      <g className="lienzo">
        {Overlay && <Overlay />}
        {nodos.map((n) => (
          <Nodo key={n.titulo} g={n} />
        ))}
      </g>
    </svg>
  )
}
