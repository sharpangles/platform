# What do NgFor, NgZone, and ngrx have in common?

## They all bridge from imperative to declarative.

All three things have the same assumption: that the original meaning of changes is lost and must be reconstituted back into a declarative space.  They start with the assumption that our apps will not likely flow well-structured events across infrastructure boundaries.

### NgZone

Device events, although already declarative, do not express application events.  They have to be taken from the environment in the form of timers, device inputs, or network events, and then translated into purposeful changes in the application.  To do this, they flow through a change detection mechanism that has to reconstitute the application purpose through hierarchies of compiled bindings in angular templates.

### NgFor

Application changes for NgFor flow through an IterableDiffers object whose default implementation constantly compares a list of old items with the data source to discover any changes to the iterable.

### ngrx

For ngrx, everything is 'reduced' to a global state object, then reconstituted into state changes via BehaviorSubjects.


In all of these tools are really good at making sense of applications that may not have much order (or much need for order) outside the user interface.  We can get away with pretty much anything from any backend or business logic.  In these cases we reinterpret meaning from the events in the UI itself and reduce changes over time into a snapshot of state.  A lot of good things can come from this.  It helps us build immutable components, rely on subscriptions to changes rather than state itself, and separate our UI into clean presentation components and event-flowing container components.

But let's look at the problems.
- We lost a lot of understanding behind the events.  In reality everything that happens in an application comes from events.  If we are designing an enterprise system distributed across devices, programming languages, and infrastructure, we get to make better choices from the beginning on how to expose these events.  Even if there is some mainframe system from the 1980's somewhere on the backend, we can still put an anti-corruption layer in front of it.
- If we were to measure the performance of event propagation in big-O notation, the 'n' in O(f(n)) is now attached roughly to the size of the context (the data set, state, or even application size), not the number of listeners.  Designing for 'performance' is always wrong, but this isn't really talking about reducing clock cycles and storage, this is more about not using an array when you should use a map.  The UI is a place where we often get away with these performance issues, since the size and scope tends to be constrained to the limits of human perception.
- Numerous copies of state are hidden all over the application: global state, BehaviorSubject state, distinctOnChanged, inputs on components, etc...
- State is no longer its original definition: state of all the components of the application.  The inputs on my presentation components should be the only real copy of state that I need.  If I want to know my UI state, shouldn't I ask the UI?
- We no longer have a living system, but a sequence of snapshots.
- We lost the ability to architect applications.  We replaced OOP principals with 'just make a lot of really small modules'.  Architecture is about decomposing complex problems into functional (NOT domain) concepts.  Once we break up these pieces by volatility, we apply them to a specific domain purpose.  That's a lot harder to do when object instances with dependency injection containers are no longer available to us to provide context to events.
- The application is optimized for initialization, not an actual running application.
- We lose imperative capabilities in many cases.  Ever get confused by the difference between imperative and declarative code?  We all have.  It's easy to see chains of subscriptions and assume its declarative, but that's just syntax.  Chaining '.thens' on promises is not really declarative, its an explicit imperative sequence.  Holding onto arrays of running tasks in a class?  It looks like imperative, but usually its just some internal implementation of a declarative design.  Here is the test: if you care about context or synchronization, its really imperative.  You may be using rxjs observables, but if you are wrapping event objects to attach state with context specific to the event source, or have synchronization capabilities (i.e. cancellation or transactional commit scopes) flowing along with those events, that's not really declarative anymore.

## A new architecture

We need a new architectural principal, one that can bring life into our system designs.  One that treats interactivity as the first-class citizen and state as the hack that gets us back to where we left off, not the other way around.  The missing piece is lifetime.





Component lifetime different from models of system lifetimes.

Init and history are simpler to understand from the state-centrist approach.  But as soon as they get more complex, we go back to events anyway.  Loading a 'state' in a different context for example (A URL sent to a different user with different theme preferences or access).