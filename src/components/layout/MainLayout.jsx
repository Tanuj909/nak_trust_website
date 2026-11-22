import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import TickerBar from './TickerBar'
import Header from './Header'
import Footer from './Footer'
import FloatingActions from '../common/FloatingActions'
import LanguagePromptModal from '../common/LanguagePromptModal'
import ScrollToTop from '../common/ScrollToTop'

export default function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <TopBar />
      <TickerBar />
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
      <LanguagePromptModal />
    </>
  )
}
