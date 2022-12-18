---
sidebar_position: 2
---

# Framework

Apache Sunny Framework provides a very light IoC container.

## Core Values

For cloud applications, being the most reactive possible is a key criteria so Sunny chose to:
* Be build time oriented: only delegate to runtime the bean resolution (to enable dynamic module aggregation) and not the bean and model discovery nor proxy generation,
* Stay flexible: even if the model is generated at build time you can generally still customize it by removing a bean and adding your own one,
* Be native friendly: some applications need to be native to start very fast and bypass the classloading and a bunch of JVM init, for that purpose we ensure the IoC is GraalVM friendly.

## Features

* Field/constructor injections
* Contexts/scopes
  * Default scope (`@DefaultScoped`) is to create an instance per lookup/injection
  * Application scope (`@ApplicationScoped`) creates an instance per container and instantiates it lazily (at first call)
* Event bus
  * `Start`/`Stop` events are fired with container related lifecycle hooks
* Lifecycle: `@Init`/`@Destroy` to react to the bean lifecycle
* `Optional<MyClass>` injections
* Basic cloud friendly configuration

> **TIP:**  See [examples](examples) to implementation examples.

## No interceptor support

Since some years we got used to see declarative interceptors (annotations) like in this snippet:

```java
public class MyBean {
    @Traced
    public void doSomething() {
        // ...
    }
}
```

These are great and the container is actually linking the annotation to an implementation (a bean in general) which intercepts the call. This is not bad but has some design pitfalls:
* Most interceptors will use parameters and for such a generic approach to work, it needs an Object[] (or List) of parameters. This is really not fast (it requires to allocate an array for that purpose).
* It requires to know and understand the rules between class interceptors, method interceptors, appending/overriding when relevant plus the same with parent classes. All that can quickly become complex.
* It is often static: once put on a method disabling an interceptor requires the underlying library to be able to do that or to use some advanced customization at startup to do it.