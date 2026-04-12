import Scene1Hero from './Scene1Hero';
import Scene2CityExploration from './Scene2CityExploration';
import Scene3Transformation from './Scene3Transformation';
import Scene4Interior from './Scene4Interior';
import Scene5Map from './Scene5Map';
import Scene6DataViz from './Scene6DataViz';
import Scene7Platform from './Scene7Platform';
import Scene8CTA from './Scene8CTA';
import styles from './SceneManager.module.css';

export default function SceneManager() {
  return (
    <div className={styles.sceneManager}>
      <Scene1Hero />
      <Scene2CityExploration />
      <Scene3Transformation />
      <Scene4Interior />
      <Scene5Map />
      <Scene6DataViz />
      <Scene7Platform />
      <Scene8CTA />
    </div>
  );
}
