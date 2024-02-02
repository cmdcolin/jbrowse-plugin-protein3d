import { useState, useEffect, useRef } from 'react'
// molstar
import { PluginContext } from 'molstar/lib/mol-plugin/context'
import { createPluginUI } from 'molstar/lib/mol-plugin-ui'
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18'
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'

// locals
import { loadStructureFromUrl } from './util'

// note: css must be injected into the js code for jbrowse plugins
import './molstar.css'

export default function useProteinView({
  url,
  showControls,
}: {
  url: string
  showControls: boolean
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [plugin, setPlugin] = useState<PluginContext>()
  const [error, setError] = useState<unknown>()
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(async () => {
      let p: PluginContext | undefined
      try {
        if (!parentRef.current) {
          return
        }
        const d = document.createElement('div')
        parentRef.current.append(d)
        p = await createPluginUI({
          target: d,
          render: renderReact18,
          spec: {
            ...DefaultPluginUISpec(),
            layout: {
              initial: {
                controlsDisplay: 'reactive',
                showControls,
              },
            },
          },
        })
        setPlugin(p)

        await loadStructureFromUrl({ url, plugin: p })
      } catch (e) {
        console.error(e)
        setError(e)
      }
      return () => {
        p?.unmount()
      }
    })()
  }, [url, showControls])

  return { parentRef, error, plugin }
}
