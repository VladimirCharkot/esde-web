import { VistaEscritos } from '@/components/vidriera/vista-escritos'
import { getEscritosIndex } from '@/lib/textos'

export default function EscritosPage() {
  return <VistaEscritos indice={getEscritosIndex()} />
}
