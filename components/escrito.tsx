'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { Barra } from './cabecera'
import { visitar } from './vidriera/utils'

interface EscritoProps {
  slug: string
  html: string
  headerNav?: {
    texto: string
    path: string
  }
}

export const Escrito = ({ slug, html, headerNav }: EscritoProps) => {
  const [y, setY] = useState(0)
  const [barraActiva, setBarraActiva] = useState(false)

  const manejarNav = () => {
    setY(window.scrollY)
    setBarraActiva(y > window.scrollY)
  }

  useEffect(() => {
    visitar(slug)
  }, [slug])

  useEffect(() => {
    setY(window.scrollY)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', manejarNav)
    return () => window.removeEventListener('scroll', manejarNav)
  }, [y])

  return (
    <>
      <Barra atrasTexto={headerNav?.texto} atrasPath={headerNav?.path} active={barraActiva} />
      <article className="texto">
        <div className="texto" dangerouslySetInnerHTML={{ __html: html }} />
        <address className="firma piel">
          <p>Sebastián Rojo</p>
          <p>&quot;El Silencio Donde Escucho&quot;</p>
        </address>
      </article>
    </>
  )
}
