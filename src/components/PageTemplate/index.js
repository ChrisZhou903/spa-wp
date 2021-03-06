import React, { PureComponent } from 'react'
import { number, object, func } from 'prop-types'
import Loadable from 'react-loadable'

import PageContent from './PageContent'
import Loading from '../Loading'
import { isBrowser } from '../../utils'
import './index.css'

const BlogPage = Loadable({
  loader: () => import(/* webpackChunkName: "blog" */ '../../containers/BlogPage'),
  loading: Loading,
})

const ContactPage = Loadable({
  loader: () => import(/* webpackChunkName: "contact" */ '../../containers/ContactPage'),
  loading: Loading,
})


class PageTemplate extends PureComponent {
  static propTypes = {
    pageId: number.isRequired,
    page: object.isRequired,
    fetchSinglePage: func.isRequired,
  }

  componentDidMount() {
    const { pageId, page, fetchSinglePage } = this.props

    if (Object.keys(page).length === 0) {
      fetchSinglePage(pageId)
    }
  }

  render() {
    const { pageId, page } = this.props
    const { slug, content, betterFeaturedImage = {}, wpsSubtitle } = page
    const pageTitle = page.title && page.title.rendered
    const desktopBg = betterFeaturedImage.sourceUrl

    return (
      <div className="app-page">
        <div
          className="app-page__hero"
          style={{
            backgroundImage: (isBrowser && desktopBg) && `url(${desktopBg})`,
          }}
        >
          <div className="app-page__title">
            {pageTitle && <h1>{pageTitle}</h1>}
            {wpsSubtitle && <h3>{wpsSubtitle}</h3>}
          </div>
        </div>
        {content && content.rendered && <PageContent content={content.rendered} />}
        {slug === 'blog' && <BlogPage />}
        {slug === 'contact' && <ContactPage pageId={pageId} />}
      </div>
    )
  }
}

export default PageTemplate
