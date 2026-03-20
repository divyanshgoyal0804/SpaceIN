'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@/hooks/useLenis';
import Scene1Hero from './Scene1Hero';
import Scene2CityExploration from './Scene2CityExploration';
import Scene3Transformation from './Scene3Transformation';
import Scene4Interior from './Scene4Interior';
import Scene5Map from './Scene5Map';
import Scene6DataViz from './Scene6DataViz';
import Scene7Platform from './Scene7Platform';
import Scene8CTA from './Scene8CTA';

export default function SceneManager() {
  const containerRef = useRef<HTMLDivElement>(null);
  useLenis(true);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.ticker.remove(() => {});
    };
  }, []);

  return (
    <div ref={containerRef} className="scene-manager">
      <Scene1Hero />
      <Scene2CityExploration />
      <Scene3Transformation />
      <Scene4Interior />
      <Scene5Map />
      <Scene6DataViz />
      <Scene7Platform />
      <Scene8CTA />

      <style jsx>{`
        .scene-manager {
          position: relative;
          width: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
