import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Lightning Fast',
    icon: <img src="img/deadline.png" width="60px" />,
    description: (
      <>
        Sunny is very light and fast. The framework provides efficient and light IoC container.
      </>
    ),
  },
  {
    title: 'Cloud applications colocation',
    icon: <img src="img/anywhere.png" width="60px" />,
    description: (
      <>
        Sunny applications manager allows you to colocate cloud applications, optimizing cloud infrastructure cost.
      </>
    ),
  },
  {
    title: 'Designed for the cloud and Kubernetes',
    icon: <img src="img/cloud.png" width="60px" />,
    description: (
      <>
        Sunny is designed for the cloud, covering cloud ecosystem scope, from the applications runtime, up to deployment including Kubernetes packages manager.
      </>
    ),
  },
];

function Feature({icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {icon}
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
