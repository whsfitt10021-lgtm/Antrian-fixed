import React from 'react'
import { FatalOverlay } from './Overlays'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, detail: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, detail: error?.message || String(error) }
  }

  componentDidCatch(error, info) {
    console.error('Gagal render aplikasi:', error, info)
  }

  render() {
    if (this.state.hasError) return <FatalOverlay detail={this.state.detail} />
    return this.props.children
  }
}
