import markdownIt from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs'
import markdownItSpans from 'markdown-it-bracketed-spans'
// @ts-expect-error sin tipos
import markdownItDivs from 'markdown-it-div'
// @ts-expect-error sin tipos
import markdownItFootnote from 'markdown-it-footnote'
import markdownItContainer from 'markdown-it-container'
import { JSDOM } from 'jsdom'

const md = markdownIt({ html: true, typographer: true })

md.use(markdownItAttrs)
md.use(markdownItSpans)
md.use(markdownItDivs)
md.use(markdownItFootnote)

md.use(markdownItContainer, 'clase', {
  validate: (params: string) => !!params.trim().match(/^(.+)\s*$/),
  render: (tokens: { nesting: number; info: string }[], idx: number) => {
    const m = tokens[idx].info.trim().match(/^(.+)\s*$/)!
    return tokens[idx].nesting === 1 ? `<div class="${md.utils.escapeHtml(m[1])}">\n` : '</div>\n'
  },
})

// Renderiza el cuerpo (sin front matter) a HTML
export const renderMarkdown = (cuerpoMd: string): string => md.render(cuerpoMd)

// Quita las imágenes de dentro de los <p>, que es como las devuelve el
// render de MD, y pone la primera como fondo de la cabecera del artículo.
export const corregirImagenes = (html: string): string => {
  const { document } = new JSDOM(html).window
  const body = document.body

  body.querySelectorAll('p img').forEach((img, n) => {
    const div = document.createElement('div')
    div.classList.add('ventana')
    if (n === 0) div.classList.add('cabecera')
    for (const attr of img.getAttributeNames()) {
      div.setAttribute(attr, img.getAttribute(attr)!)
    }
    div.style.setProperty('--url-imagen', `url(${img.getAttribute('src')})`)
    if (img.getAttribute('data-pos')) div.style.setProperty('--posicion', img.getAttribute('data-pos')!)
    if (img.getAttribute('data-escala')) div.style.setProperty('--escala', img.getAttribute('data-escala')!)
    img.parentElement!.replaceWith(div)
    div.appendChild(img)
  })

  const titulo = body.querySelector('h2')
  const imagen = body.querySelector('.ventana')
  if (titulo && imagen) imagen.appendChild(titulo)

  return body.innerHTML.trim()
}

// Renderiza el cuerpo de un texto a HTML final, listo para el artículo
export const renderTexto = (cuerpoMd: string): string => corregirImagenes(renderMarkdown(cuerpoMd))
