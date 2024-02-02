import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { ErrorMessage } from '@jbrowse/core/ui'
import { doesIntersect2, getSession } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// locals
import { ProteinViewModel } from '../model'
import useProteinView from './useProteinView'

// note: css must be injected into the js code for jbrowse plugins
import './molstar.css'

const ProteinView = observer(function ({ model }: { model: ProteinViewModel }) {
  const { url, mapping, showControls } = model
  const dimensions = { width: model.width, height: 500 }
  const session = getSession(model)
  const { plugin, parentRef, error } = useProteinView({ url, showControls })
  const [error2, setError2] = useState<unknown>()

  useEffect(() => {
    if (!plugin) {
      return
    }

    plugin.state.data.events.changed.subscribe(() => {
      try {
        const clickedLabel =
          plugin.state.getSnapshot().structureFocus?.current?.label
        console.log({ clickedLabel }, plugin.state.getSnapshot())

        if (clickedLabel) {
          const [clickPos, chain] = clickedLabel?.split('|') ?? []
          const [code, position] = clickPos.trim().split(' ')
          const pos = +position.trim()
          console.log({ pos, code, chain })
          model.setMouseClickedPosition({ pos, code, chain })
          for (const entry of mapping) {
            const {
              featureStart,
              featureEnd,
              refName,
              proteinStart,
              proteinEnd,
              strand,
            } = entry
            const c = pos - 1
            if (doesIntersect2(proteinStart, proteinEnd, c, c + 1)) {
              const ret = Math.round((c - proteinStart) * 3)
              const neg = strand === -1
              const start = neg ? featureEnd - ret : featureStart + ret
              const end = neg ? featureEnd - ret - 3 : featureStart + ret + 3
              const [s1, s2] = [Math.min(start, end), Math.max(start, end)]
              model.setHighlights([
                {
                  assemblyName: 'hg38',
                  refName,
                  start: s1,
                  end: s2,
                },
              ])
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              ;(session.views[0] as LinearGenomeViewModel).navToLocString(
                `${refName}:${s1}-${s2}`,
              )
            }
          }
        } else {
          model.setMouseClickedPosition(undefined)
        }
      } catch (e) {
        console.error(e)
        setError2(e)
      }
    })
  }, [plugin, mapping, session, model])

  const width = dimensions.width
  const height = dimensions.height

  const e = error || error2
  return e ? (
    <ErrorMessage error={e} />
  ) : (
    <div>
      <Header model={model} />
      <div ref={parentRef} style={{ position: 'relative', width, height }} />
    </div>
  )
})

const Header = observer(function ({ model }: { model: ProteinViewModel }) {
  const { showControls, mouseClickedString } = model
  return (
    <div>
      {mouseClickedString} <label htmlFor="show_controls">Show controls?</label>
      <input
        id="show_controls"
        type="checkbox"
        checked={showControls}
        onChange={event => model.setShowControls(event.target.checked)}
      />
    </div>
  )
})

const Wrapper = observer(function ({ model }: { model: ProteinViewModel }) {
  const { url } = model
  return (
    <div>
      <div>{url}</div>
      <ProteinView model={model} />
    </div>
  )
})

export default Wrapper
