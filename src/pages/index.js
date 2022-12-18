import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner, styles.heroContainer)}>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="The Java stack designed for cloud">
      <HomepageHeader />
      <main>
        <div className={clsx('container', styles.punchLine)}>
          <h1 className={clsx('margin-bottom--lg')}>{siteConfig.tagline}</h1>
        </div>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
