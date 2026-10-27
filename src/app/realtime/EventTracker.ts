type TrackedEvent = {
  eventId: string;
  type: string;
  resource: { id: string };
  version: number;
};

const MAX_SEEN_EVENTS = 500;

export class EventTracker {
  private seen = new Set<string>();
  private versions = new Map<string, number>();

  accept(event: TrackedEvent) {
    if (this.seen.has(event.eventId)) {
      return false;
    }

    this.seen.add(event.eventId);

    if (this.seen.size > MAX_SEEN_EVENTS) {
      this.seen.delete(this.seen.values().next().value!);
    }

    const key = `${event.type}:${event.resource.id}`;

    if ((this.versions.get(key) ?? 0) >= event.version) {
      return false;
    }

    this.versions.set(key, event.version);

    return true;
  }
}
