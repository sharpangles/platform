# @sharpangles/deps

## Dependency Injection

Dependency injection systems are at the heart of most non-naive applications.
At the heart of dependency injection is lifetime management.
Most underlying frameworks hide lifetime details of services.
- AspNet core provides an application lifetime and http-request lifetimes transparently.
- Angular ties lifetime management directly to component lifetime.
- Declarative models tie lifetime to listeners.

Enterprise systems often need to manage lifetime in more complex ways:
- Custom management of lifetime hierarchies.
- Lifetime associated with long-lived entities.
- Lifetime distributed across applications or environments.
- Explicit coupling between services across lifetimes.

Almost every DI framework has at least one of the following flaws:
- They are feature-heavy dictionaries with no lifetime management.
- They become meta-frameworks that leak their references everywhere by various explicit types and metadata.
- They do not support remote resolution strategies (asynchronous).
- They couple lifetime management to service registration.
- They couple context of resolution to lifetime.

This library does offer leakage of metadata in one case, via the decorator ```@Disposable()```.
Disposal signifies the end of a lifetime and is a common abstraction between object lifetime (handled in the language or execution environment) and service lifetime (handled by DI).
Attachment to object lifetime is a fundamental concept required for any execution environment that simplifies object lifetime management via garbage collection.
We view the omission of this hook as one of several javascript flaws, so we'll overlook this one.
Besides, several other techniques are provided to manage disposal of services, so there is no requirement to share a common abstraction of lifetime between services and objects.
However, use of the decorator is recommended.
