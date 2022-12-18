---
sidebar_position: 1
---

# Apache Sunny

Apache Sunny is a Java stack allowing the implementation and distribution of cloud native Java software easily.
It covers the full cloud native software lifecyle: implement, build including native support, package and distribute.
Sunny focuses on Java stack to implement cloud applications and using de-facto standards in the Java and cloud worlds (Apache Maven, Kubernetes, GraalVM, ...).

Sunny is a neutral and stable backbone to write out cloud software. Sunny is the Java cloud solution to go native efficiently and easily.

Sunny is the full Java stack answering the following needs:
* A light cloud friendly stack
* A colocalization backbone
* A set of cloud deployment helpers
The goal is really to go fast and with a single reference project to the cloud.

## Sunny, designed for the cloud

Cloud applications introduced new challenges for developers and runtime:
* Fast loading is important to optimize the "ready to serve" time but also the memory and CPU usage.
* Resources efficient applications to reduce power consumption, and so cost, in a serverless friendly approach.
* Immutable but flexible runtime, with optional dynamic loading.

Apache Sunny provides a full Java stack to address these challenges, making all team members happy with the deliveries (easy for developers, light for ops, common to monitor for ops and secops).

Apache Sunny is composed by:
* **Sunny Framework** is a light and fast IoC container, acting as service registry and beans loader.
* **Sunny Applications Manager** is a runtime supporting applications colocalization, with seamless integration withint Kubernetes API (ConfigMap for configuration, Service Discovery based on Kubernetes coredns to easily discover and communicate between applications, ...).
* **Sunny Kubernetes Deployer** is both a Kubernetes packages manager leveraging Apache Maven repositories to resolve dependencies and deploy artifacts. It's similar to Helm but for the Java ecosystem and without any requirement in terms of infrastructure/server. It also includes a Kubernetes Operator to easily manager and provision Sunny applications manager and K8S orchestrator for cluster management. 