import { Feature } from '@jbrowse/core/util'
import { genomeToTranscriptSeqMapping as g2p } from 'g2p_mapper'

export interface Alignment {
  alns: {
    id: string
    seq: string
  }[]
}

export function structureSeqVsTranscriptSeqMap(alignment: Alignment) {
  const structureSeq = alignment.alns[0].seq
  const transcriptSeq = alignment.alns[1].seq
  if (structureSeq.length !== transcriptSeq.length) {
    throw new Error('mismatched length')
  }

  let j = 0
  let k = 0
  const structureSeqToTranscriptSeqPosition = {} as Record<
    string,
    number | undefined
  >
  const transcriptSeqToStructureSeqPosition = {} as Record<
    string,
    number | undefined
  >

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < structureSeq.length; i++) {
    const c1 = structureSeq[i]
    const c2 = transcriptSeq[i]

    if (c1 === c2) {
      structureSeqToTranscriptSeqPosition[j] = k
      transcriptSeqToStructureSeqPosition[k] = j
      k++
      j++
    } else if (c2 === '-') {
      j++
    } else if (c1 === '-') {
      k++
    } else {
      structureSeqToTranscriptSeqPosition[j] = k
      transcriptSeqToStructureSeqPosition[k] = j

      k++
      j++
    }
  }
  return {
    structureSeqToTranscriptSeqPosition,
    transcriptSeqToStructureSeqPosition,
  }
}

export function structurePositionToAlignmentMap(alignment: Alignment) {
  const structureSeq = alignment.alns[0].seq
  const structurePositionToAlignment = {} as Record<string, number | undefined>

  for (let i = 0, j = 0; i < structureSeq.length; i++) {
    if (structureSeq[i] !== '-') {
      structurePositionToAlignment[j] = i
      j++
    }
  }

  return structurePositionToAlignment
}

export function transcriptPositionToAlignmentMap(alignment: Alignment) {
  const transcriptSeq = alignment.alns[1].seq
  const transcriptPositionToAlignment = {} as Record<string, number | undefined>

  for (let i = 0, j = 0; i < transcriptSeq.length; i++) {
    if (transcriptSeq[i] !== '-') {
      transcriptPositionToAlignment[j] = i
      j++
    }
  }

  return transcriptPositionToAlignment
}

// see similar function in msaview plugin
export function genomeToTranscriptSeqMapping(feature: Feature) {
  // @ts-expect-error
  return g2p(feature.toJSON())
}
