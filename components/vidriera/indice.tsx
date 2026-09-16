'use client'

import { capitalize, debounce, groupBy } from 'lodash'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useVidriera } from './contexto'

export default function Indice() {
  const router = useRouter()
  const { nodos, setEnfocado } = useVidriera()

  // Al scrollear la lista con la rueda/trackpad, el contenido se mueve bajo un puntero que
  // sigue quieto, y eso también dispara mouseenter en cada <li> que va pasando por debajo.
  // Guardamos la posición del puntero en el último trigger real y lo ignoramos si no cambió.
  const ultimoPunteroRef = React.useRef<{ x: number; y: number } | null>(null)

  const debouncedEnfocar = React.useMemo(
    () =>
      debounce((slug: string) => {
        setEnfocado(slug)
      }, 300),
    [setEnfocado]
  )

  React.useEffect(() => {
    return () => {
      debouncedEnfocar.cancel()
    }
  }, [debouncedEnfocar])

  const grupos = groupBy(
    nodos.filter((e) => e.slug),
    (e) => e.fm?.serie || 'otros'
  )

  return (
    <div className="indice">
      <ol>
        {Object.entries(grupos).map(([serie, entradasSerie]) => (
          <li key={serie}>
            <strong>{serie !== 'otros' ? capitalize(serie) : 'Otros escritos'}</strong>
            <ol>
              {entradasSerie.map((e) => (
                <li
                  key={e.slug}
                  onClick={() => {
                    if (e.accion) e.accion()
                    else if (e.slug) router.push(`/escritos/${e.slug}`)
                  }}
                  onMouseEnter={(evento) => {
                    const { clientX: x, clientY: y } = evento
                    if (ultimoPunteroRef.current?.x === x && ultimoPunteroRef.current?.y === y) return
                    console.log(x,y)
                    ultimoPunteroRef.current = { x, y }

                    if (e.slug) debouncedEnfocar(e.slug)
                  }}
                  onMouseLeave={() => setEnfocado(null)}
                >
                  {e.titulo}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  )
}
