'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Barra, CabeceraProps } from '../cabecera'
import { TelonBienvenida } from '../telon'
import { useVidriera } from './contexto'
import Indice from './indice'
import { Animacion, Layout, Menu } from './tipos'
import { Vidriera } from './vidriera'

/**
 * Telón + Vidriera + Barra
 */
export interface VistaProps {
  animacion?: Animacion // Animación inicial, usualmente pan y zoom
  menu: Menu // Nodos de la vidriera
  layout: Layout // Función que asigna posición inicial a cada nodo
  Overlay?: React.FC
  headerNav?: CabeceraProps
  titulo?: string
  indice?: boolean
}

export const Vista = ({ headerNav, menu, indice = false, Overlay, ...vidriera }: VistaProps) => {
  const router = useRouter()

  useEffect(() => {
    document.title = vidriera.titulo ?? 'El Silencio Donde Escucho'
  }, [vidriera.titulo])

  const [telonListo, setTelonListo] = React.useState(false)

  const { montar } = useVidriera()

  useEffect(() => {
    if (!telonListo) return
    menu((path) => router.push(path)).then((nodos) => {
      montar({ nodos, layout: vidriera.layout, animacion: vidriera.animacion })
    })
  }, [telonListo])

  return (
    <>
      <TelonBienvenida onDesvanecer={() => setTelonListo(true)} />
      <Barra atrasTexto={headerNav?.atrasTexto} atrasPath={headerNav?.atrasPath} />
      <Vidriera Overlay={Overlay} />
      {indice && <Indice />}
    </>
  )
}
