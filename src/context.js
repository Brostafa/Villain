import React, { Component } from 'react'
export const ReaderContext = React.createContext()

const defaultState = {
  pages: [],
  ready: false,
  error: null,
  totalPages: 0,
  isLastPage: false,
  isFirstPage: true,
  currentPage: null,

  // Settings
  theme: 'dark',
  bookMode: false,
  fullscreen: false,
}

export class ReaderProvider extends Component {
  state = { ...defaultState }

  updateState = data => {
    this.setState(data)
  }

  toggleSetting = setting => {
    this.setState(prevState => ({ [setting]: !prevState[setting] }))
  }

  createPage = page => {
    const pages = this.state.pages.concat(page)
    if (page.index === 0) {
      this.setState({
        ready: true,
        error: null,
        currentPage: 0,
        pages,
      })
    } else {
      this.setState({ pages })
    }
  }

  trigger = (eventName, data) => {
    if (eventName === 'error' && data) {
      console.error(data)
      this.setState({ ready: false, error: data })
    }

    if (eventName === 'loaded' && data) {
      this.setState({ ...data })
    }
  }

  navigateToPage = pageIndex => {
    this.setState(prevState => {
      const { totalPages } = prevState.totalPages
      // Validate page index
      if (
        (pageIndex < 0 && pageIndex >= totalPages) ||
        pageIndex == prevState.currentPage
      )
        return {}
      // Update state
      const isLastPage = pageIndex === totalPages - 1
      const isFirstPage = pageIndex === 0
      return { isLastPage, isFirstPage, currentPage: pageIndex }
    })
  }

  navigateForward = () => {
    const { isLastPage, currentPage } = this.state
    if (!isLastPage) {
      this.navigateToPage(currentPage + 1)
    }
  }

  navigateBackward = () => {
    const { isFirstPage, currentPage } = this.state
    if (!isFirstPage) {
      this.navigateToPage(currentPage - 1)
    }
  }

  getPage = index => {
    const { pages, bookMode, totalPages } = this.state
    const page = pages[index]
    const nextIndex = index + 1
    const nextPageExists = nextIndex >= 0 || nextIndex < totalPages
    const shouldRenderBookMode =
      nextPageExists && !(index === 0 || index === totalPages - 1)

    // Return two pages
    if (this.state.bookMode && shouldRenderBookMode) {
      const nextPage = pages[nextIndex]
      return [page, nextPage]
    }

    // Return single page
    return page
  }

  render() {
    return (
      <ReaderContext.Provider
        value={{
          state: this.state,
          trigger: this.trigger,
          getPage: this.getPage,
          createPage: this.createPage,
          updateState: this.updateState,
          toggleSetting: this.toggleSetting,
          navigateToPage: this.navigateToPage,
          navigateForward: this.navigateForward,
          navigateBackward: this.navigateBackward,
        }}
      >
        {this.props.children}
      </ReaderContext.Provider>
    )
  }
}

//  Access context
// <ReaderContext.Consumer> { context => (<div />)}<ReaderContext.Consumer/>
