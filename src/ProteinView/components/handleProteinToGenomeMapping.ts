import { doesIntersect2, getSession } from '@jbrowse/core/util'
import { ProteinViewModel } from '../model'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export async function handleProteinToGenomeMapping({
  model,
  pos,
}: {
  pos: number
  model: ProteinViewModel
}) {
  const { mapping } = model
  const session = getSession(model)
  if (!mapping) {
    return
  }
  const lgv = session.views[0] as LinearGenomeViewModel
  for (const entry of mapping) {
    const {
      featureStart,
      featureEnd,
      refName,
      targetProteinStart: proteinStart,
      targetProteinEnd: proteinEnd,
      phase,
      strand,
    } = entry
    if (proteinStart === undefined || proteinEnd === undefined) {
      console.warn('No mapping', proteinStart, proteinEnd)
      break
    } else {
      const c = pos - 1
      console.log({ c, c1: c + 1, proteinStart, proteinEnd })
      if (doesIntersect2(proteinStart, proteinEnd, c, c + 1)) {
        const ret = Math.round((c - proteinStart) * 3)
        const neg = strand === -1
        const p = (3 - phase) % 3
        const start = neg ? featureEnd - ret + p : featureStart + ret - p
        const end = neg ? featureEnd - ret - 3 + p : featureStart + ret + 3 - p
        const [s1, s2] = [Math.min(start, end), Math.max(start, end)]
        model.setHighlights([
          {
            assemblyName: 'hg38',
            refName,
            start: s1,
            end: s2,
          },
        ])
        await lgv.navToLocString(`${refName}:${s1}-${s2}`)
        break
      }
    }
  }
}
