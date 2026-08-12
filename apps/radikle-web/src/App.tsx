import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Stories from './pages/Stories';
import WhatWeDo from './pages/WhatWeDo';
import RevealPage from './pages/RevealPage';
import Disha from './pages/Disha';
import Discover from './pages/Discover';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/what-we-do" element={<WhatWeDo />} />
        <Route path="/reveal" element={<RevealPage />} />
        <Route path="/disha" element={<Disha />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
