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

For these reasons, we think that we don't need an interceptor solution in Sunny Framework, even if the underlying feature makes sense.
Thanks to a more modern programming style, we can use a more functional approach to solve the same problem. Therefore, previous example would rather become:

```java
public class MyBean {
    public void doSomething() {
        tracing(() -> {
            // ...
        });
    }
}
```

The big advantage is you can use some static utility if you want but also rely on beans and even combine more efficiently interceptions in a custom and configurable fashion:

```java
public class MyBean {
    public void doSomething() {
        tracing(() -> timed(() -> logged(() -> {
            // ...
        })));
    }
}
```

can become:

```java
public class MyBean {
    @Injection
    MyObservabilityService obs;

    public void doSomething() {
        obs.instrumented(() -> {
            // ...
        });
    }
}
```

If you compare the case with parameters it is way more efficient in general since you just do a standard parameter passing call:

```java
public class MyBean {
    @Injection
    EntityManager em; // assume the application used JPA - not required

    @Injection
    JpaService jpa; // custom bean to handle transactions for ex

    public void store(final Transaction tx) {
        tracing(
          // no Object[] created for an interceptor
          // and no reflection to extract the id
          tx.id(),
          () -> jpa.tx(() -> em.persist(tx)));
    }
}
```

---
**TIP**

Going with this solution can, however, get the _chaining lambda_ pitfall (e.g. _callback hell_ in JavaScript), to solve this one we encourage you to ensure your "interceptor" can be chained properly using thee same kind of callback.

Here is an example (the important part is more the signature than the fact it is a `static` method or bean method):

```java
public static <T> Supplier<T> interceptor1(String marker, Map<String, String> data, Supplier<T> nested) {
    return () -> {
        logger.info(message(marker, data)); // interceptor role
        return task.get();  // intercepted business, "ic.proceed()" in jakarta interceptor API
    };
}


public static <T> Supplier<T> interceptor12(Params params, Supplier<T> nested) {
    // same kind of logic for the impl
}
```

Thanks this definition which commonly agreed to use `Supplier<T>` as the intercepted call and the fact interceptor methods return a call and not execute it directly, you can chain them more easily:

```java
public void storeCustomer(final Customer customer) {
    interceptor2(
            Params.of(customer),
            interceptor1(
                "incoming-customer", Map.of("id", customer.id()),
                () -> {
                    // business code
                }))
    .get(); // trigger the actual execution, it is the terminal operation for the chain
}
```

If you want to go further you can use a `Stream` to represent that. Now an interceptor is a `Function<Supplier<T>, Supplier<T>>` so if you define the list of interceptors in a `Stream`, then you can just reduce them using the business function/logic as identity to have the actual invocation and execute it.
Only detail to take care: ensure to reverse the stream to call the interceptor in order:

```java
public void storeCustomer(final Customer customer) {
    Stream.<Function<Supplier<Void>, Supplier<Void>>>of(
                // reversed chain of interceptor (i1 will be executed before i2)
                delegate -> interceptor2(Params.of(customer), delegate),
                delegate -> interceptor1("incoming-customer", Map.of("id", customer.id()), delegate)
        )
        // merge the stream of interceptors as one execution wrapper
        .reduce(identity(), Function::andThen)
        .apply(() -> { // apply to the actual business logic
            System.out.println(">Business");
            return null;
        })
        .get(); // execute it
}
```

Indeed in practise you can extract that kind of code in an utility and use something like:

```java
// utility
public static <T> T intercepted(final Supplier<T> execution, final Function<Supplier<T>, Supplier<T>>... interceptors) {
    return Stream.of(interceptors)
            .reduce(identity(), Function::andThen)
            .apply(execution)
            .get();
}

// usage
intercepted(
    () -> { // business logic
        System.out.println(">Business");
        return null;
    },
    // interceptors
    delegate -> interceptor2(Params.of(customer), delegate),
    delegate -> interceptor1("incoming-customer", Map.of("id", customer.id()), delegate)
);
```

This is what the class `org.apache.sunny.framework.api.composable.Wraps` does.

---

> **TIP:**  your interceptor can work with `CompletionStage` to add some behavior before/after the call even if the results is not computed synchronously.

## Limitations

> **NOTE:** these limitations are _as of today_, none are _technically_ strong limitations we can't fix in the future.

* A no-arg constructor must be available for any class bean.
* If a method producer bean is `AutoCloseable` then it will be automatically closed.
* Event methods can not be package scope if the enclosing bean uses a subclass proxy (like `@ApplicationScoped` context).
* Constructor injections are supported but for proxied scopes (`@ApplicationScoped` for instance) it requires a default no-arg constructor (in scope `protected` or `public`) in the class.
* Event bus listeners can only have the event as method parameter.
* Only classes are supported exception for method producers which can return a `ParameterizedType` (for example `List<String>`) but injections must exactly match this type and `List`/`Set` injections are handled by looking up all beans matching the parameter.

## Setup

Sunny Framework uses three main modules:

* API: the runtime API, mainly resolution/look-up oriented.
* Build API: the build time API, it is intended to be used to trigger the generation of the runtime classes using processor module.
* Processor: it contains the magic generating most of the runtime and making the IoC efficient and light.

Therefore the project will generally get the _api_ in scope _compile_, the build api in scope _provided_ or _optional_ and the processor either in scope _provided_/_optional_ or just defined as an annotation processor in your compiler configuration.

> **IMPORTANT** the generation process assumes the annotation processor is aware of all classes, depending the tools you generate you can need to disable incremental compilation as of today to ensure all classes are seen by the generator.

### Maven

#### Simplest

The simplest is to just add the API (scope `compile`) and processor (scope `provided`):

```xml
<dependencies>
  <dependency>
    <groupId>org.apache.sunny</groupId>
    <artifactId>sunny-framework-api</artifactId>
    <version>${sunny-framework.version}</version>
  </dependency>
  <dependency>
    <groupId>org.apache.sunny</groupId>
    <artifactId>sunny-framework-processor</artifactId>
    <version>${sunny-framework.version}</version>
    <scope>provided</scope>
  </dependency>
</dependencies>
```

> **TIP** it can be sane to compile your project with Maven (`mvn compile` or `mvn process-classes`) instead of relying on your IDE. This is indeed a general rule but, in this case, will enable to avoid the pitfalls of a fake incremental compilation (compiling only a few source files using the precompiled project output). This last case can lead to missing bean, you can obviously delete the `target` folder of your project to force your IDE to recompile but it is saner to just rely on a properly compile phase.

