import { Component, type ReactNode } from 'react'

type SceneErrorBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
}

type SceneErrorBoundaryState = {
  hasError: boolean
}

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}
