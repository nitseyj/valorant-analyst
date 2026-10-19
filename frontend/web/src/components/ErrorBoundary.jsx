import { Component } from 'react'
import { Panel, Label, Button } from './ui'

// Error boundaries must be class components: componentDidCatch and
// getDerivedStateFromError have no hook equivalent. Scoped to whatever
// subtree it wraps, so one page's render error does not blank the sidebar
// or the rest of the app around it.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <Panel className="p-8 md:p-12 max-w-xl mx-auto text-center">
          <Label tone="brand" className="mb-3">Something went wrong</Label>
          <h1 className="font-display text-2xl font-bold mb-3">This page hit an error</h1>
          <p className="text-sm text-ink-dim mb-6">
            Reloading usually fixes it. The detail is in the browser console if it keeps happening.
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Panel>
      )
    }
    return this.props.children
  }
}
