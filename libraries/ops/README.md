# @sharpangles/ops
Operational management of systems.  Initially targeting devops and build environments.  Other potential future systems include IT infrastructure, interconnected IoT devices, or even manufacturing.




## Key concepts

### TrackerProcess
A one-time process that starts, progresses, and then completes either by success, failure, or cancellation.
Base implementations:
- AsyncTrackerProcess: Wraps a promise
- CancelPollingProcess: Allows for a cancellation check at each progress event
- SubscriptionProcess: Maps an observable subscription

### Tracker
An aggregator of processes that track a particular concept in an environment.
Each tracker is responsible for creating and executing processes of a particular type.
Several base tracker implementations are provided:
- SubjectTracker: Aggregates events from all running process observables through the tracker observables.
- MutexTracker: Waits for any existing process to complete before starting a new one
- OverridingTracker: Cancels the previous process to start a new one

#### Connection
Connects events from a source tracker to effects on a target.
This allows two trackers to be connected without knowing about each other, while still allowing each tracker an opportunity to manage the connection.

#### TrackerFactory
Creates 

#### TrackerFactoryLoader
Constructs factories from names and configuration.  This potentially connect the system to public and private repositories.

#### TrackerContext
Manages the graph of factories and trackers for the process.
