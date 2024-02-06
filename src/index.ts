import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import { AbstractSessionModel, isAbstractMenuManager } from '@jbrowse/core/util'
import { types } from 'mobx-state-tree'
// locals
import { version } from '../package.json'
import ProteinViewF from './ProteinView'
import LaunchProteinViewF from './LaunchProteinView'
import AddHighlightModelF from './AddHighlightModel'
import ProteinModelSessionExtension from './ProteinModelSessionExtension'

export default class ProteinViewer extends Plugin {
  name = 'ProteinViewer'
  version = version

  install(pluginManager: PluginManager) {
    ProteinViewF(pluginManager)
    LaunchProteinViewF(pluginManager)
    AddHighlightModelF(pluginManager)

    pluginManager.addToExtensionPoint('Core-extendSession', session => {
      return types.compose(
        types.model({
          proteinModel: types.optional(ProteinModelSessionExtension, {}),
        }),
        // @ts-expect-error
        session,
      )
    })
  }

  configure(pluginManager: PluginManager) {
    if (isAbstractMenuManager(pluginManager.rootModel)) {
      pluginManager.rootModel.appendToMenu('Add', {
        label: 'Protein View',
        onClick: (session: AbstractSessionModel) => {
          session.addView('ProteinView', {})
        },
      })
    }
  }
}
