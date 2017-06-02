# @sharpangles/ops
Operational management of systems.  Initially targeting devops and build environments.  Other potential future systems include a running application, IT infrastructure, interconnected IoT devices, or even manufacturing.
___


## What It Does
This enables modeling a system, whether its a programming environment or a kitchen, to enable understanding and interacting with its state.
It works by building up networks of ```trackers``` in a hierarchy of ```systems```.  Trackers expose ```interfaces``` where ```connections``` can be made.
Think of it as a dynamic ```observable``` network that lives in between two layers of design: individual state-modifying activities underneath, and a dynamic control flow designer above.
The operations model of trackers, connectors, interfaces, are all designed to change over time.  Each change exposes imperative extensibility, as well as declarative observables for changes.

## The Declarative Sandwich
In more complex systems, the architecture is often a set of alternating layers of imperative and declarative programming.
When talking about declarative vs imperative, one often thinks of observables vs promises.  While there is some truth to this, observables are not entirely declarative.
Even observables are built on top of an imperative layer or sorts.  For example, whether an observable is hot or cold deals with a point of execution.
RXJS operators themselves, particularly custom ones, frequently perform imperative work.
So now we have somewhat of an imperative layer below a declarative one.  However, something had to define how that network of observables was constructed.  Something has to assign meaning to events flowing through the network.
In fact, frequently we add state information to the event being passed so we can track individual actions (although this is often an anti-pattern, a sign of forcing imperative into declarative).
Now we have another imperative layer on top.  There is always an imperative layer on top.  It may live in configuration via json, factories, or a DSL, but it exists to define the control flow of the system.

The point is that there is no 'declarative vs imperative' war.  It's just that strong achitectures treat them like oil and water, strictly separated.
This library attempts to do this, living mostly in the declarative middle.
The configuration and buildup of the network via factories would serve as the top imperative layer, where control flow is ultimately created.
The operations model (connectors, connections, trackers, interfaces, etc...) exposes most of its customizable actions as an imperative async/await surface, while mapping those executions to observable transitions.
Container objects (trackers, systems, interfaces) expose synchronous points of extensibility to add components.
Connection objects (connectors, connections) provide async extension points


## Key concepts

### Tracker
Models an idea, behavior, or object in a system.  Contains ```interfaces```.

### System
A ```tracker``` that has child trackers.  Encapsulates a lifetime, exposing a dependency injection scope.

### Interface
Exposes events via ```connectors``` that can trigger, notify, or otherwise expose details about an activity on the ```tracker```.
This is main point at which work on ```trackers``` is performed.

#### Connector
Exposes a point of interaction for an ```interface```.

#### Connection
Connects two ```connectors``` together.

#### Arranger
Manipulates the system by creating and removing ```connections``` and ```trackers```.

#### ArrangerSource
Loads ```arrangers``` based on a string identifier and json configuration.




stuff about how transitions separate the work from the skeleton...
