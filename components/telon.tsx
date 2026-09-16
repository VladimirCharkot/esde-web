'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

type EstadoTelon =
  | 'visible' // Telón visible
  | 'aparecer' // Telón visible y contenido fade in
  | 'desvanecer' // Telón desvaneciéndose
  | 'escondido' // Telón escondido del DOM

interface TelonProps extends React.PropsWithChildren {
  onDesvanecer?: () => void
  estado: EstadoTelon
}

type DecisionTelon = 'largo' | 'corto' | 'omitir'

export const TelonBienvenida = ({ onDesvanecer }: Omit<TelonProps, 'estado'>) => {
  const umbral = 1000 * 60 * 60 * 24 // Un día, en ms

  const [decision, setDecision] = useState<DecisionTelon | null>(null)

  useEffect(() => {
    // Ya se mostró en esta sesión (pestaña): no lo repetimos en cada transición entre páginas
    if (sessionStorage.getItem('telon_mostrado')) {
      setDecision('omitir')
      return
    }
    sessionStorage.setItem('telon_mostrado', '1')

    const t0 = localStorage.getItem('ultima_visita')
    const primerAccesoDelDia = !t0 || Date.now() - parseInt(t0) > umbral
    localStorage.setItem('ultima_visita', Date.now().toString())

    setDecision(primerAccesoDelDia ? 'largo' : 'corto')
  }, [umbral])

  useEffect(() => {
    // Si lo omitimos, nadie más va a llamar a onDesvanecer por nosotros
    if (decision === 'omitir') onDesvanecer?.()
  }, [decision, onDesvanecer])

  // Esperamos a decidir qué telón mostrar (o si corresponde omitirlo) antes de renderizar algo
  if (decision === null || decision === 'omitir') return null

  return decision === 'largo' ? (
    <TelonDescripcion estado="visible" onDesvanecer={onDesvanecer} />
  ) : (
    <TelonTitulo estado="visible" onDesvanecer={onDesvanecer} />
  )
}

export const TelonDescripcion = ({ onDesvanecer }: TelonProps) => {
  const [estado, setEstado] = useState<EstadoTelon>('aparecer')
  const desvanecer: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    setEstado('desvanecer')
  }

  return (
    <Telon estado={estado} onDesvanecer={onDesvanecer}>
      <h1>El Silencio Donde Escucho</h1>
      <p>¡Te damos la bienvenida!</p>
      <p>
        ESDE es un proceso de enseñanza <b>vivo</b>. De un grupo de trabajo por la libertad interior y para el encuentro
        con la Verdad. En este sitio están congregados los escritos del equipo desde sus inicios, nuestra historia y
        nuestros proyectos.
      </p>
      <p>
        También extendemos el Trabajo en actividades presenciales, encuentros, ejercicios, rondas, seminarios y otras.
        Están disponibles aquí algunas propuestas.
      </p>
      <p>
        Nos encontramos cerca de Ciudad de Córdoba. Nos movemos donde el Trabajo nos convoque. Te damos la bienvenida a
        entrar en contacto, si así lo sentís, al mail que se encuentra al final de la sección de identidad.
      </p>
      <p>
        ¡Adelante! Te invitamos a navegar los escritos, que están agrupados por temática. Al regresar al sitio vas a
        encontrar marcados los que ya hayas visitado.
      </p>
      <p>Buen provecho!</p>
      <a href="#" onClick={desvanecer}>
        Seguir al sitio
      </a>
    </Telon>
  )
}

export const TelonTitulo = ({ onDesvanecer }: TelonProps) => {
  const [estado, setEstado] = useState<EstadoTelon>('aparecer')
  const desvanecer = () => setEstado('desvanecer')

  useEffect(() => {
    setTimeout(desvanecer, 1000)
  }, [])

  return (
    <Telon estado={estado} onDesvanecer={onDesvanecer}>
      <h1>El Silencio Donde Escucho</h1>
    </Telon>
  )
}

export const Telon = ({ onDesvanecer, estado, children }: TelonProps) => {
  const [estadoLocal, setEstadoLocal] = useState<EstadoTelon | null>(null)

  useEffect(() => {
    if (estado === 'desvanecer') {
      onDesvanecer?.()
      setTimeout(() => setEstadoLocal('escondido'), 4000) // Lo que demora en desvanecerse
    }
  }, [estado, onDesvanecer])

  return (
    <div className={`telon ${estadoLocal ?? estado}`}>
      <div>{children}</div>
    </div>
  )
}
