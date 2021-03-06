import React from 'react'
import { array } from 'prop-types'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Layout } from 'antd'
import Loadable from 'react-loadable'

import Header from './Header'
import Footer from '../components/Footer'
import Loading from './Loading'
import AsyncCompLoading from '../components/Loading'
import { getSlugFromUrl } from '../utils'

const Home = Loadable({
  loader: () => import(/* webpackChunkName: "homepage" */ './HomePage'),
  loading: AsyncCompLoading,
})
const PageTemplate = Loadable({
  loader: () => import(/* webpackChunkName: "page" */ './PageTemplate'),
  loading: AsyncCompLoading,
})
const NoMatch = Loadable({
  loader: () => import(/* webpackChunkName: "no-match" */ './NoMatch'),
  loading: AsyncCompLoading,
})


const { Content } = Layout

const App = ({
  topMenu,
}) => {
  const pageRoutes = topMenu.length > 0 ? topMenu.map(menu => {
    const slug = getSlugFromUrl(menu.url)

    if (slug === 'home') {
      return [
        <Route exact path="/" component={() => <Home pageId={menu.objectId} />} />,
        <Route path="/home" render={() => <Redirect to="/" />} />,
      ]
    }

    if (menu.children.length > 0) {
      return menu.children.map(subMenu => {
        if (subMenu.children.length > 0) {
          return subMenu.children.map(thirdMenu => <Route key={thirdMenu.objectId} path={`/${getSlugFromUrl(thirdMenu.url)}`} component={() => <PageTemplate pageId={thirdMenu.objectId} />} />)
        }

        return <Route key={subMenu.objectId} path={`/${getSlugFromUrl(subMenu.url)}`} component={() => <PageTemplate pageId={subMenu.objectId} />} />
      })
    }

    return <Route key={menu.objectId} path={`/${slug}`} component={() => <PageTemplate pageId={menu.objectId} />} />
  }) : <Route exact path="/" component={Home} />

  return (
    <Layout className="layout">
      <Header />
      <Content>
        <Switch>
          {pageRoutes}
          {topMenu.length > 0 && <Route component={NoMatch} />}
        </Switch>
      </Content>
      <Footer />
      <Loading />
    </Layout>
  )
}

App.propTypes = {
  topMenu: array.isRequired,
}

export default App
